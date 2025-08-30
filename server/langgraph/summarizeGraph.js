// server/langgraph/summarizeGraph.js
const axios = require('axios');
const JournalEntry = require('../models/JournalEntry');
const { z } = require('zod');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;

let compiledPromise = null;

async function pineconeUpsert({ id, embedding, metadata, namespace = 'default' }) {
	await axios.post(
		`${PINECONE_HOST}/vectors/upsert`,
		{ vectors: [{ id, values: embedding, metadata }], namespace },
		{ headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
	);
}

const JournalSummarySchema = z.object({
	summary: z.string(),
	bullets: z.array(z.string()).min(1).max(10),
	mood: z.string(),
	tags: z.array(z.string()).min(1).max(8),
	sentiment: z.string(),
	intent: z.string(),
});

const ChatImportanceSchema = z.object({
	isImportant: z.boolean(),
	reason: z.string(),
});

const ChatBulletsSchema = z.object({
	bullets: z.array(z.string()).min(1).max(5),
});

async function buildSummarizeGraph() {
	const { StateGraph, END, START } = await import('@langchain/langgraph');
	const { ChatOpenAI } = await import('@langchain/openai');
	const { CohereEmbeddings } = await import('@langchain/cohere');

	const llm = new ChatOpenAI({
		apiKey: GROQ_API_KEY,
		configuration: { baseURL: GROQ_BASE_URL },
		model: 'llama-3.3-70b-versatile',
		temperature: 0.4,
		maxTokens: 600,
	});

	const cohereEmbeddings = new CohereEmbeddings({
		apiKey: process.env.COHERE_API_KEY,
		model: 'embed-english-v3.0',
	});

	const graph = new StateGraph({
		channels: {
			type: 'string', // "journal" or "chat"
			userId: 'string',
			entryId: { default: null },
			title: { default: '' },
			content: 'string',
			summaryData: { default: null },
			importanceData: { default: null },
			bulletsData: { default: null },
			embedding: { default: null },
			upserted: { default: false },
		},
	});

	// Node for journal summarization (full pipeline)
	graph.addNode('summarizeJournal', async (state) => {
		const system = `You are Lumora, an intelligent journaling assistant. Return JSON only.`;
		const user = `Analyze the following journal entry and return a JSON with keys: summary, bullets[], mood, tags[], sentiment, intent. Entry:\n\n\"\"\"${state.content}\"\"\"`;
		const messages = [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		];
		const res = await llm.invoke(messages, {
			runName: 'summarize.summarizeJournal',
			tags: ['langgraph', 'graph:summarize', 'node:summarizeJournal'],
			metadata: { userId: state.userId, entryId: state.entryId },
		});
		const text = typeof res === 'string' ? res : res?.content || '';
		// Robust JSON extract
		const first = text.indexOf('{');
		const last = text.lastIndexOf('}');
		if (first === -1 || last === -1 || last <= first) throw new Error('No JSON in LLM output');
		const json = JSON.parse(text.slice(first, last + 1));
		const parsed = JournalSummarySchema.parse(json);
		return { ...state, summaryData: parsed };
	});

	// Node for chat importance classification
	graph.addNode('classifyChatImportance', async (state) => {
		const system = `You are Lumora, an intelligent assistant that determines if chat messages contain important information worth remembering. Return JSON only.`;
		const user = `Analyze this chat message and determine if it contains important information that should be remembered for future reference. Consider things like: personal insights, emotional revelations, important decisions, significant events, or meaningful reflections.\n\nMessage: "${state.content}"\n\nReturn JSON with keys: isImportant (boolean), reason (string explaining why it is or isn't important)`;
		const messages = [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		];
		const res = await llm.invoke(messages, {
			runName: 'summarize.classifyChatImportance',
			tags: ['langgraph', 'graph:summarize', 'node:classifyChatImportance'],
			metadata: { userId: state.userId },
		});
		const text = typeof res === 'string' ? res : res?.content || '';
		// Robust JSON extract
		const first = text.indexOf('{');
		const last = text.lastIndexOf('}');
		if (first === -1 || last === -1 || last <= first) throw new Error('No JSON in LLM output');
		const json = JSON.parse(text.slice(first, last + 1));
		const parsed = ChatImportanceSchema.parse(json);
		return { ...state, importanceData: parsed };
	});

	// Node for generating chat bullets (only if important)
	graph.addNode('generateChatBullets', async (state) => {
		if (!state.importanceData?.isImportant) return state;
		
		const system = `You are Lumora, an intelligent assistant that extracts key points from important chat messages. Return JSON only.`;
		const user = `Extract 2-4 key bullet points from this important chat message. Focus on actionable insights, emotional revelations, or significant information.\n\nMessage: "${state.content}"\n\nReturn JSON with key: bullets[] (array of 2-4 concise bullet points)`;
		const messages = [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		];
		const res = await llm.invoke(messages, {
			runName: 'summarize.generateChatBullets',
			tags: ['langgraph', 'graph:summarize', 'node:generateChatBullets'],
			metadata: { userId: state.userId },
		});
		const text = typeof res === 'string' ? res : res?.content || '';
		// Robust JSON extract
		const first = text.indexOf('{');
		const last = text.lastIndexOf('}');
		if (first === -1 || last === -1 || last <= first) throw new Error('No JSON in LLM output');
		const json = JSON.parse(text.slice(first, last + 1));
		const parsed = ChatBulletsSchema.parse(json);
		return { ...state, bulletsData: parsed };
	});

	// Node for embedding bullets
	graph.addNode('embedBullets', async (state) => {
		let bulletText = '';
		
		if (state.type === 'journal' && state.summaryData?.bullets?.length) {
			bulletText = state.summaryData.bullets.join(' ');
		} else if (state.type === 'chat' && state.bulletsData?.bullets?.length) {
			bulletText = state.bulletsData.bullets.join(' ');
		}
		
		if (!bulletText) return state;
		
		const embedding = await cohereEmbeddings.embedQuery(bulletText, {
			runName: 'summarize.embedBullets',
			tags: ['langgraph', 'graph:summarize', 'node:embedBullets'],
			metadata: { userId: state.userId, entryId: state.entryId || null },
		});
		return { ...state, embedding };
	});

	// Node for upserting to Pinecone
	graph.addNode('upsertPinecone', async (state) => {
		if (!state.embedding) return state;
		
		let metadata = {
			userId: state.userId,
			date: new Date().toISOString(),
		};
		
		if (state.type === 'journal') {
			metadata = {
				...metadata,
				entryId: state.entryId,
				title: state.title,
				summary: state.summaryData.summary,
				bullets: state.summaryData.bullets,
				tags: state.summaryData.tags,
				sentiment: state.summaryData.sentiment,
				intent: state.summaryData.intent,
				type: 'journal',
			};
		} else if (state.type === 'chat') {
			metadata = {
				...metadata,
				content: state.content,
				bullets: state.bulletsData.bullets,
				importance: state.importanceData.reason,
				type: 'chat',
			};
		}
		
		const id = state.type === 'journal' ? state.entryId : `chat_${state.userId}_${Date.now()}`;
		
		await pineconeUpsert({
			id,
			embedding: state.embedding,
			metadata,
		});
		return { ...state, upserted: true };
	});

	// Node for persisting journal summaries to DB
	graph.addNode('persistJournalSummary', async (state) => {
		if (state.type !== 'journal' || !state.entryId) return state;
		
		const entry = await JournalEntry.findOne({ _id: state.entryId, user: state.userId });
		if (!entry) return state;
		
		const originalCreatedAt = entry.createdAt;
		Object.assign(entry, state.summaryData);
		entry.createdAt = originalCreatedAt;
		await entry.save();
		return state;
	});

	// Conditional routing based on type
	graph.addConditionalEdges(START, (state) => {
		if (state.type === 'journal') return 'summarizeJournal';
		if (state.type === 'chat') return 'classifyChatImportance';
		return END;
	});

	// Journal flow
	graph.addEdge('summarizeJournal', 'embedBullets');
	graph.addEdge('embedBullets', 'upsertPinecone');
	graph.addEdge('upsertPinecone', 'persistJournalSummary');
	graph.addEdge('persistJournalSummary', END);

	// Chat flow
	graph.addConditionalEdges('classifyChatImportance', (state) => {
		if (state.importanceData?.isImportant) return 'generateChatBullets';
		return END; // End if not important
	});
	graph.addEdge('generateChatBullets', 'embedBullets');
	graph.addEdge('embedBullets', 'upsertPinecone');
	graph.addEdge('upsertPinecone', END);

	return graph.compile();
}

async function ensureCompiled() {
	if (!compiledPromise) {
		compiledPromise = buildSummarizeGraph();
	}
	return compiledPromise;
}

async function invoke(input, options = {}) {
	const compiled = await ensureCompiled();
	const result = await compiled.invoke(input, options);
	return result;
}

module.exports = { summarizeGraph: { invoke } }; 