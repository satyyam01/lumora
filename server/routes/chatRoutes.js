const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

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

module.exports = router; 