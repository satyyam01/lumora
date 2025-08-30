const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const journalController = require('../controllers/journalController');
const { summarizeGraph } = require('../langgraph/summarizeGraph');

// Protect all routes with auth middleware
router.use(auth);

// Create a new journal entry
router.post('/', journalController.createEntry);

// Get all journal entries for the authenticated user
router.get('/', journalController.getEntries);

// Get today's journal entries
router.get('/today', journalController.getTodaysEntries);

// Get today's mood and sentiment
router.get('/stats/today-mood', journalController.getTodayMood);

// Get weekly sentiment trend
router.get('/stats/weekly-sentiment', journalController.getWeeklySentimentTrend);

// Get user streak data
router.get('/stats/streak', journalController.getStreakData);

// Get a single journal entry by ID
router.get('/:id', journalController.getEntryById);

// Update a journal entry by ID
router.put('/:id', journalController.updateEntry);

// Delete a journal entry by ID
router.delete('/:id', journalController.deleteEntry);

// Test summarization graph
router.post('/test/summarize', async (req, res) => {
  try {
    const { entryId, title, content } = req.body;
    if (!content || !entryId) return res.status(400).json({ message: 'entryId and content are required.' });
    const result = await summarizeGraph.invoke({ userId: req.user.userId, entryId, title: title || '', content });
    res.json({ ok: true, summaryData: result.summaryData });
  } catch (e) {
    res.status(500).json({ message: 'LangGraph summarize test failed', error: e.message });
  }
});

module.exports = router; 