const JournalEntry = require('../models/JournalEntry');
const { summarizeJournalEntry } = require('../ai/summarize');

// Create a new journal entry
exports.createEntry = async (req, res) => {
  try {
    const { title, content } = req.body;
    const entry = new JournalEntry({
      title,
      content,
      user: req.user.userId
    });
    await entry.save();
    // Summarize and update
    try {
      const summaryData = await summarizeJournalEntry(content);
      Object.assign(entry, summaryData);
      await entry.save();
    } catch (aiErr) {
      // Log but don't block user
      console.error('Summarization error:', aiErr.message);
    }
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all journal entries for the authenticated user
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single journal entry by ID (must belong to user)
exports.getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a journal entry (must belong to user)
exports.updateEntry = async (req, res) => {
  try {
    const { title, content } = req.body;
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, content },
      { new: true, runValidators: true }
    );
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    // Summarize and update
    try {
      const summaryData = await summarizeJournalEntry(content);
      Object.assign(entry, summaryData);
      await entry.save();
    } catch (aiErr) {
      console.error('Summarization error:', aiErr.message);
    }
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a journal entry (must belong to user)
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get today's journal entries
exports.getTodaysEntries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const entries = await JournalEntry.find({
      user: userId,
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get today's mood and sentiment (most recent entry)
exports.getTodayMood = async (req, res) => {
  try {
    const userId = req.user.userId;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const entry = await JournalEntry.findOne({
      user: userId,
      createdAt: { $gte: start, $lte: end },
      mood: { $exists: true, $ne: null },
      sentiment: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });
    if (!entry) return res.json({ mood: null, sentiment: null });
    res.json({ mood: entry.mood, sentiment: entry.sentiment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get weekly sentiment trend (past 7 days, most recent per day)
exports.getWeeklySentimentTrend = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const start = new Date(day);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      const entry = await JournalEntry.findOne({
        user: userId,
        createdAt: { $gte: start, $lte: end },
        sentiment: { $exists: true, $ne: null }
      }).sort({ createdAt: -1 });
      trend.push(entry ? entry.sentiment : null);
    }
    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add a log to today's entry
exports.addLogToToday = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Log content is required.' });
    }
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let entry = await JournalEntry.findOne({
      user: userId,
      createdAt: { $gte: start, $lte: end }
    });
    if (!entry) {
      entry = new JournalEntry({
        title: 'Today',
        content,
        user: userId,
        logs: [{ content }]
      });
    } else {
      entry.logs.push({ content });
    }
    // Build full context: main content + all logs
    const fullContext = [entry.content, ...entry.logs.map(log => log.content)].filter(Boolean).join('\n');
    // Re-run summarization on the full context
    try {
      const summaryData = await summarizeJournalEntry(fullContext);
      Object.assign(entry, summaryData);
    } catch (aiErr) {
      console.error('Summarization error:', aiErr.message);
    }
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a log in a journal entry
exports.updateLog = async (req, res) => {
  try {
    const { id, logId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Log content is required.' });
    }
    const entry = await JournalEntry.findOne({ _id: id, user: req.user.userId });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    const log = entry.logs.id(logId);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    log.content = content;
    // Re-run summarization on the full context
    const fullContext = [entry.content, ...entry.logs.map(l => l.content)].filter(Boolean).join('\n');
    try {
      const summaryData = await summarizeJournalEntry(fullContext);
      Object.assign(entry, summaryData);
    } catch (aiErr) {
      console.error('Summarization error:', aiErr.message);
    }
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a log in a journal entry
exports.deleteLog = async (req, res) => {
  try {
    const { id, logId } = req.params;
    const entry = await JournalEntry.findOne({ _id: id, user: req.user.userId });
    if (!entry) {
      console.error('Entry not found:', id);
      return res.status(404).json({ message: 'Entry not found' });
    }
    const logIndex = entry.logs.findIndex(l => l._id && l._id.toString() === logId);
    if (logIndex === -1) {
      console.error('Log not found:', logId, 'in entry:', entry._id, entry.logs.map(l => l._id && l._id.toString()));
      return res.status(404).json({ message: 'Log not found' });
    }
    entry.logs.splice(logIndex, 1);
    // Re-run summarization on the full context
    const fullContext = [entry.content, ...entry.logs.map(l => l.content)].filter(Boolean).join('\n');
    try {
      const summaryData = await summarizeJournalEntry(fullContext);
      Object.assign(entry, summaryData);
    } catch (aiErr) {
      console.error('Summarization error:', aiErr.message);
    }
    await entry.save();
    res.json(entry);
  } catch (err) {
    console.error('Delete log error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 