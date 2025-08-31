const ChatSession = require('../models/ChatSession');
const JournalEntry = require('../models/JournalEntry');
const { chatGraph } = require('../langgraph/chatGraph');
const { summarizeGraph } = require('../langgraph/summarizeGraph');

// POST /api/chat/session - Start a new chat session
exports.startChatSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message, entryId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const result = await chatGraph.invoke({ userId, sessionId: null, entryId: entryId || null, query: message, messages: [] });
    
    // Persist as session
    const session = await ChatSession.create({
      user: userId,
      entry: entryId || null,
      title: entryId ? (await JournalEntry.findById(entryId))?.title || message.slice(0, 40) : message.slice(0, 40),
      messages: [
        { role: 'user', content: message },
        { role: 'ai', content: result.answer }
      ]
    });

    return res.status(201).json({
      sessionId: session._id,
      messages: session.messages,
      answer: result.answer,
      title: session.title,
      entry: entryId ? { _id: entryId, title: result.entryTitle || '' } : null
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

    const N = 6;
    const recentMessages = session.messages.slice(-N).map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }));
    const result = await chatGraph.invoke({ userId, sessionId, entryId: session.entry || null, query: message, messages: recentMessages });
    
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'ai', content: result.answer });
    await session.save();

    return res.json({ messages: session.messages, answer: result.answer });

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
    
    const userId = req.user.userId;
    const result = await chatGraph.invoke({ userId, query: message });
    return res.json({ answer: result.answer, matches: result.matches || [] });
    
  } catch (err) {
    console.error('Chatbot retrieval error:', err.message);
    res.status(500).json({ message: 'Chatbot retrieval failed', error: err.message });
  }
}; 