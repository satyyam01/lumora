const JournalEntry = require('../models/JournalEntry');
const { summarizeJournalEntry } = require('../ai/summarize');
const { embedTextWithCohere } = require('../ai/cohere');
const { upsertToPinecone, queryPinecone } = require('../ai/pinecone');
const { callLLM } = require('../ai/llm');

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
      // --- New: Embed bullet points and upsert to Pinecone ---
      if (summaryData.bullets && Array.isArray(summaryData.bullets)) {
        const bulletText = summaryData.bullets.join(' ');
        const embedding = await embedTextWithCohere(bulletText);
        await upsertToPinecone({
          id: entry._id.toString(),
          embedding,
          metadata: {
            entryId: entry._id.toString(),
            userId: entry.user.toString(),
            date: entry.createdAt,
            title: entry.title,
            summary: entry.summary,
            bullets: summaryData.bullets,
            tags: entry.tags,
            sentiment: entry.sentiment,
            intent: entry.intent,
          },
        });
      }
      // --- End Pinecone upsert ---
    } catch (aiErr) {
      // Log but don't block user
      console.error('Summarization/embedding error:', aiErr.message);
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
      // --- New: Embed bullet points and upsert to Pinecone ---
      if (summaryData.bullets && Array.isArray(summaryData.bullets)) {
        const bulletText = summaryData.bullets.join(' ');
        const embedding = await embedTextWithCohere(bulletText);
        await upsertToPinecone({
          id: entry._id.toString(),
          embedding,
          metadata: {
            entryId: entry._id.toString(),
            userId: entry.user.toString(),
            date: entry.createdAt,
            title: entry.title,
            summary: entry.summary,
            bullets: summaryData.bullets,
            tags: entry.tags,
            sentiment: entry.sentiment,
            intent: entry.intent,
          },
        });
      }
      // --- End Pinecone upsert ---
    } catch (aiErr) {
      // Log but don't block user
      console.error('Summarization/embedding error:', aiErr.message);
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

// Get user streak data
exports.getStreakData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all entries for this user, sorted by date (newest first)
    const entries = await JournalEntry.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();
    
    if (entries.length === 0) {
      return res.json({
        current: 0,
        longest: 0,
        thisWeek: 0
      });
    }
    
    // Calculate current streak
    let currentStreak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasEntry = entries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
      
      if (hasEntry) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    
    for (const entry of entries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      if (lastDate === null) {
        tempStreak = 1;
        lastDate = entryDate;
      } else {
        const diffDays = Math.floor((lastDate - entryDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = entryDate;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // Calculate this week's entries
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart;
    });
    
    // Count unique days this week
    const uniqueDaysThisWeek = new Set();
    thisWeekEntries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      uniqueDaysThisWeek.add(entryDate.toISOString().split('T')[0]);
    });
    
    res.json({
      current: currentStreak,
      longest: longestStreak,
      thisWeek: uniqueDaysThisWeek.size
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Chatbot endpoint: receives a user message, retrieves relevant journal entries
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
    const prompt = `You are an empathetic journaling assistant. The user asked: "${message}"

Here are the most relevant journal entries:\n${context}

Based only on these entries, answer the user's question with specific details, patterns, and insights. Be concise, supportive, and information-rich.`;
    // Call LLM
    const llmResponse = await callLLM(prompt);
    res.json({ answer: llmResponse, matches });
  } catch (err) {
    console.error('Chatbot retrieval error:', err.message);
    res.status(500).json({ message: 'Chatbot retrieval failed', error: err.message });
  }
}; 