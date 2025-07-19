const { embedTextWithCohere } = require('../ai/cohere');
const { queryPinecone } = require('../ai/pinecone');
const { callChat } = require('../ai/llm');
const ChatSession = require('../models/ChatSession');
const JournalEntry = require('../models/JournalEntry');

// POST /api/chat/session - Start a new chat session
exports.startChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, entryId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }

    let context = '';
    let entryTitle = '';
    if (entryId) {
      // Entry-specific chat: fetch only that entry
      const entry = await JournalEntry.findOne({ _id: entryId, user: userId });
      if (!entry) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      entryTitle = entry.title;
      context = `Entry Title: ${entry.title}\nEntry Content: ${entry.content}`;
    } else {
      // Global chat: fetch relevant entries
      const embedding = await embedTextWithCohere(message);
      const matches = await queryPinecone({ embedding, topK: 5, namespace: 'default' });
      context = matches.map((m, i) => {
        const date = m.metadata?.date ? new Date(m.metadata.date).toLocaleDateString() : 'Unknown date';
        const summary = m.metadata?.summary || '';
        const bullets = Array.isArray(m.metadata?.bullets) ? m.metadata.bullets.join(' | ') : '';
        return `${i + 1}. [${date}] ${summary}${bullets ? ' | ' + bullets : ''}`;
      }).join('\n');
    }

    // Step 2: Build optimized prompt for the LLM
    const prompt = `
You are Lumora, a calm and emotionally intelligent journaling assistant.

A user just asked: "${message}"

Below are the user's most relevant past journal entries with summaries and emotional highlights:

${context}

Based strictly on these entries:
- Reflect on the user’s recurring emotional patterns, struggles, or growth.
- Reference specific memories, realizations, or emotional notes that could provide clarity or support.
- Avoid being vague or overly generic — ground your answer in the actual entries.
- Be encouraging, warm, and insightful — like a thoughtful friend who remembers everything and speaks with care.

Respond now to the user's question with meaningful insights and emotionally intelligent suggestions.
    `.trim();

    let sessionTitle = '';
    if (entryId && entry) {
      sessionTitle = entry.title;
    } else {
      sessionTitle = message.slice(0, 40);
    }

    // Step 3: Get response from the LLM
    const aiResponse = await callChat(prompt);

    // Step 4: Create new chat session and save conversation
    const session = await ChatSession.create({
      user: userId,
      entry: entryId || null,
      title: sessionTitle,
      messages: [
        { role: 'user', content: message },
        { role: 'ai', content: aiResponse }
      ]
    });

    // Step 5: Return the session ID and messages
    res.status(201).json({
      sessionId: session._id,
      messages: session.messages,
      answer: aiResponse,
      title: session.title,
      entry: entryId ? { _id: entryId, title: entryTitle } : null
    });

  } catch (err) {
    console.error('Start chat session error:', err.message);
    res.status(500).json({ message: 'Failed to start chat session', error: err.message });
  }
};

// POST /api/chat/session/:id - Continue an existing chat session
exports.continueChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const session = await ChatSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get last N messages for context
    const N = 6;
    const recentMessages = session.messages.slice(-N);

    // Filter out invalid messages
    const chatHistory = recentMessages
      .filter(m => typeof m.content === 'string' && m.content.trim() !== '')
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

    // Add the current user message
    chatHistory.push({ role: 'user', content: message });

    // Build messages array for LLM
    const messages = [
      {
        role: 'system',
        content:
          `You are Lumora, a thoughtful and empathetic journaling assistant. ` +
          `Your job is to help the user reflect, understand their thoughts, and gain emotional clarity. ` +
          `Use a warm, encouraging tone. When appropriate, reference patterns, moods, or entries they’ve shared before.`
      },
      ...chatHistory
    ];

    // Strong filter for LLM input
    const safeMessages = messages.filter(
      m =>
        (m.role === 'user' || m.role === 'assistant' || m.role === 'system') &&
        typeof m.content === 'string' &&
        m.content.trim() !== ''
    );

    console.log("Sending messages to LLM:", JSON.stringify(safeMessages, null, 2));

    // Call Mixtral via callChat (must accept `messages`)
    const aiResponse = await callChat({ messages: safeMessages });

    // Save user and AI messages to session
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'ai', content: aiResponse });
    await session.save();

    res.json({ messages: session.messages, answer: aiResponse });
  } catch (err) {
    console.error('Continue chat session error:', err.message);
    res.status(500).json({ message: 'Failed to continue chat session', error: err.message });
  }
};


// GET /api/chat/sessions - List all chat sessions for the user
exports.listChatSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessions = await ChatSession.find({ user: userId })
      .populate('entry', 'title')
      .sort({ createdAt: -1 })
      .select('_id title entry createdAt closed summary');
    res.json({ sessions });
  } catch (err) {
    console.error('List chat sessions error:', err.message);
    res.status(500).json({ message: 'Failed to list chat sessions', error: err.message });
  }
};

// GET /api/chat/session/:id - Get a single chat session
exports.getChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.id;
    const session = await ChatSession.findOne({ _id: sessionId, user: userId })
      .populate('entry', 'title content');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ session });
  } catch (err) {
    console.error('Get chat session error:', err.message);
    res.status(500).json({ message: 'Failed to get chat session', error: err.message });
  }
};

// DELETE /api/chat/session/:id - Delete a chat session
exports.deleteChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.id;
    const session = await ChatSession.findOneAndDelete({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete chat session error:', err.message);
    res.status(500).json({ message: 'Failed to delete chat session', error: err.message });
  }
};

// Chatbot endpoint: receives a user message, retrieves relevant journal entries, and generates a response
exports.chatWithJournal = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }
    // Embed the user message
    const embedding = await embedTextWithCohere(message);
    // Query Pinecone for top 5 relevant entries for this user
    const matches = await queryPinecone({ embedding, topK: 5, namespace: 'default' });
    // Format context for LLM
    const context = matches.map((m, i) => {
      const date = m.metadata?.date ? new Date(m.metadata.date).toLocaleDateString() : 'Unknown date';
      const summary = m.metadata?.summary || '';
      const bullets = Array.isArray(m.metadata?.bullets) ? m.metadata.bullets.join(' | ') : '';
      return `${i + 1}. [${date}] ${summary}${bullets ? ' | ' + bullets : ''}`;
    }).join('\n');
    // Build prompt
    const prompt = `
You are an empathetic journaling assistant helping users reflect on their past entries. The user asked: "${message}"

Below are the most relevant past journal summaries, including emotional highlights and key takeaways:

${context}

Based only on these past entries:
- Understand the user's emotional patterns, struggles, progress, or decisions.
- Reference relevant events or realizations that could help them reflect or decide.
- Avoid generic responses. Ground your answer in specifics from the summaries.
- Be emotionally supportive, insightful, and thoughtful — like a kind friend who remembers everything.

Respond directly to the user's message with clear insights, helpful suggestions, and a warm tone.
`;

    // Call Mixtral LLM for chat
    const llmResponse = await callChat(prompt);
    res.json({ answer: llmResponse, matches });
  } catch (err) {
    console.error('Chatbot retrieval error:', err.message);
    res.status(500).json({ message: 'Chatbot retrieval failed', error: err.message });
  }
}; 