const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');
const { chatGraph } = require('../langgraph/chatGraph');

// Protect all routes with auth middleware
router.use(auth);

// Chat session endpoints
router.post('/session', chatController.startChatSession); // Start new session
router.post('/session/:id', chatController.continueChatSession); // Continue session
router.get('/sessions', chatController.listChatSessions); // List sessions
router.get('/session/:id', chatController.getChatSession); // Get session
router.delete('/session/:id', chatController.deleteChatSession); // Delete session

// Stateless chatbot endpoint (single-turn)
router.post('/chat', chatController.chatWithJournal);

// Test endpoint for LangGraph chat
router.post('/test/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required.' });
    const result = await chatGraph.invoke({ userId: req.user.userId, query: message });
    res.json({ answer: result.answer, matches: result.matches || [] });
  } catch (e) {
    res.status(500).json({ message: 'LangGraph chat test failed', error: e.message });
  }
});

module.exports = router; 