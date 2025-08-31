// server/langgraph/chatGraph.js
const axios = require('axios');
const JournalEntry = require('../models/JournalEntry');
const { summarizeGraph } = require('./summarizeGraph');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST = process.env.PINECONE_HOST;
let compiledPromise = null;

async function buildChatGraph() {
	const { StateGraph, END, MemorySaver, START } = await import('@langchain/langgraph');
	const { ChatOpenAI } = await import('@langchain/openai');
	const { CohereEmbeddings } = await import('@langchain/cohere');

	// Shared clients
	const llm = new ChatOpenAI({
		apiKey: GROQ_API_KEY,
		configuration: { baseURL: GROQ_BASE_URL },
		model: 'llama-3.3-70b-versatile',
		temperature: 0.7,
		maxTokens: 1024,
	});

	const cohereEmbeddings = new CohereEmbeddings({
		apiKey: process.env.COHERE_API_KEY,
		model: 'embed-english-v3.0',
	});

	async function pineconeQuery({ embedding, topK = 5, namespace = 'default', userId = null }) {
		const queryBody = { 
			vector: embedding, 
			topK, 
			includeMetadata: true, 
			namespace 
		};
		
		// Add user filter if userId is provided
		if (userId) {
			queryBody.filter = { userId };
		}
		
		const resp = await axios.post(
			`${PINECONE_HOST}/query`,
			queryBody,
			{ headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
		);
		return resp.data.matches || [];
	}

	const graph = new StateGraph({
		channels: {
			userId: 'string',
			sessionId: { default: null },
			entryId: { default: null },
			query: 'string',
			messages: { default: [] },
			embedding: { default: null },
			matches: { default: [] },
			context: { default: '' },
			answer: { default: '' },
			entryTitle: { default: '' },
		},
	});

	graph.addNode('loadContext', async (state) => {
		if (state.entryId) {
			const entry = await JournalEntry.findOne({ _id: state.entryId, user: state.userId });
			if (entry) {
				return {
					...state,
					entryTitle: entry.title || '',
					context: `Entry Title: ${entry.title}\nEntry Content: ${entry.content}`,
				};
			}
		}
		return state;
	});

	graph.addNode('embedQuery', async (state) => {
		if (state.entryId) return state; // skip if entry-specific
		const embedding = await cohereEmbeddings.embedQuery(state.query, {
			runName: 'chat.embedQuery',
			tags: ['langgraph', 'graph:chat', 'node:embedQuery'],
			metadata: { userId: state.userId, sessionId: state.sessionId || null, entryId: state.entryId || null },
		});
		return { ...state, embedding };
	});

	graph.addNode('retrieveDocs', async (state) => {
		if (state.entryId) return state; // skip if entry-specific
		if (!state.embedding) return state;
		
		console.log('🔍 Retrieving docs for user:', state.userId);
		const matches = await pineconeQuery({ 
			embedding: state.embedding, 
			topK: 5, 
			namespace: 'default',
			userId: state.userId  // ✅ Add user filtering!
		});
		console.log('📊 Found matches:', matches.length);
		if (matches.length > 0) {
			console.log('   First match metadata:', matches[0].metadata);
		}
		
		return { ...state, matches };
	});

	graph.addNode('assembleContext', async (state) => {
		if (state.entryId) {
		  // Only include the current entry
		  return { ...state, context: `Entry Title: ${state.entryTitle}\nEntry Content: ${state.context}` };
		}
	  
		console.log('🧩 Assembling context from', state.matches?.length || 0, 'matches');
		
		// Otherwise include only recent/relevant summaries
		console.log('📅 Date filtering details:');
		const cutoffDate = new Date(Date.now() - 7*24*60*60*1000);
		console.log('   Cutoff date (7 days ago):', cutoffDate.toISOString());
		
		// Temporarily remove date filtering to debug
		const context = (state.matches || [])
		  .map((m, i) => {
			const date = m.metadata?.date ? new Date(m.metadata.date).toLocaleDateString() : 'Unknown date';
			const summary = m.metadata?.summary || '';
			const bullets = Array.isArray(m.metadata?.bullets) ? m.metadata.bullets.join(' | ') : '';
			console.log(`   Processing entry ${i + 1}: ${date} - ${summary}`);
			return `${i + 1}. [${date}] ${summary}${bullets ? ' | ' + bullets : ''}`;
		  })
		  .join('\n');
		
		console.log('📝 Final context length:', context.length);
		console.log('📝 Context preview:', context.substring(0, 200) + '...');
	  
		return { ...state, context };
	  });
	  

	  graph.addNode('generate', async (state) => {
		const system = [
			"You are Lumora, a kind and understanding journaling companion.",
			"Talk to the user like a supportive friend would — warm, gentle, and empathetic.",
			"Weave in past journal insights only when they truly help the user reflect.",
			"Keep your responses natural and flowing, not repetitive or robotic.",
			"Encourage the user to explore their feelings with curiosity and care.",
			"Answer questions clearly, share thoughtful reflections, give grounded advice, or offer gentle suggestions and ideas when appropriate.",
			"Focus on connection and understanding, rather than interrogation."
		  ].join(' ');

		let userPrompt;
		if (state.entryId) {
		  userPrompt = [
			`A user asked: "${state.query}"`,
			'Here is the relevant journal entry:',
			state.context,
			'Please answer grounded in this entry.',
		  ].join('\n\n');
		} else {
		  userPrompt = [
			`A user asked: "${state.query}"`,
			'Here are the most relevant past journal summaries:',
			state.context,
			'Please answer grounded in these entries.',
		  ].join('\n\n');
		}
	  
		// Filter last N user messages only
		const MAX_MESSAGES = 5;
		const messages = [
		  { role: 'system', content: system },
		  ...(Array.isArray(state.messages) ? state.messages : [])
			.filter(m => m && m.content && m.role === 'user')  // only user messages
			.slice(-MAX_MESSAGES),
		  { role: 'user', content: userPrompt },
		];
	  
		const res = await llm.invoke(messages, {
		  runName: 'chat.generate',
		  tags: ['langgraph', 'graph:chat', 'node:generate'],
		  metadata: { userId: state.userId, sessionId: state.sessionId || null, entryId: state.entryId || null },
		});
	  
		const answer = typeof res === 'string' ? res : res?.content || '';
		return { ...state, answer };
	  });

	graph.addNode('summarizeChat', async (state) => {
		// Fire-and-forget: Call summarize graph without waiting
		summarizeGraph.invoke({
			type: 'chat',
			userId: state.userId,
			content: state.query,
		}).catch(error => {
			// Log but don't block the chat response
			console.error('Chat summarization error:', error.message);
		});
		return state; // Returns immediately
	});

	graph.addEdge(START, 'loadContext');
	graph.addConditionalEdges('loadContext', (s) => (s.entryId ? 'generate' : 'embedQuery'));
	graph.addEdge('embedQuery', 'retrieveDocs');
	graph.addEdge('retrieveDocs', 'assembleContext');
	graph.addEdge('assembleContext', 'generate');
	graph.addEdge('generate', 'summarizeChat');
	graph.addEdge('summarizeChat', END);

	return graph.compile({ checkpointer: new MemorySaver() });
}

async function ensureCompiled() {
	if (!compiledPromise) {
		compiledPromise = buildChatGraph();
	}
	return compiledPromise;
}

async function invoke(input, options = {}) {
	const compiled = await ensureCompiled();
	const configurable = { thread_id: input.sessionId || `${input.userId || 'anon'}:${Date.now()}` };
	const result = await compiled.invoke(input, { configurable, ...options });
	return result;
}

module.exports = { chatGraph: { invoke } }; 