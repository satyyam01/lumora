const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { summarizeJournalEntry } = require('../ai/summarize');
const { embedTextWithCohere } = require('../ai/cohere');
const { upsertToPinecone, queryPinecone } = require('../ai/pinecone');
const { callLLM } = require('../ai/llm');
const moment = require('moment-timezone');
const { summarizeGraph } = require('../langgraph/summarizeGraph');

// Function to update user streak data
async function updateUserStreak(userId, entryDate, createdAt) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const entryDateOnly = new Date(entryDate);
    entryDateOnly.setHours(0, 0, 0, 0);
    
    const createdAtOnly = new Date(createdAt);
    createdAtOnly.setHours(0, 0, 0, 0);

    // Check if this is a valid streak entry (createdAt and createdForDate are the same day)
    const isSameDay = entryDateOnly.getTime() === createdAtOnly.getTime();
    
    if (!isSameDay) {
      // If dates don't match, reset streak
      user.streakData.currentStreak = 0;
      user.streakData.lastEntryDate = null;
      user.streakData.lastEntryCreatedAt = null;
      await user.save();
      return;
    }

    // Check if this is a consecutive day
    let isConsecutive = false;
    if (user.streakData.lastEntryDate) {
      const lastEntryDate = new Date(user.streakData.lastEntryDate);
      lastEntryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((entryDateOnly.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
      isConsecutive = daysDiff === 1;
    } else {
      // First entry or after a break
      isConsecutive = true;
    }

    if (isConsecutive) {
      // Increment current streak
      user.streakData.currentStreak += 1;
    } else {
      // Check if it's the same day as last entry
      const lastEntryDate = new Date(user.streakData.lastEntryDate);
      lastEntryDate.setHours(0, 0, 0, 0);
      
      if (entryDateOnly.getTime() === lastEntryDate.getTime()) {
        // Same day entry, don't change streak
        return;
      } else {
        // Break in streak, reset to 1
        user.streakData.currentStreak = 1;
      }
    }

    // Update longest streak if current streak is longer
    if (user.streakData.currentStreak > user.streakData.longestStreak) {
      user.streakData.longestStreak = user.streakData.currentStreak;
    }

    // Update last entry dates
    user.streakData.lastEntryDate = entryDateOnly;
    user.streakData.lastEntryCreatedAt = createdAtOnly;

    await user.save();
  } catch (error) {
    console.error('Error updating user streak:', error);
  }
}

// Create a new journal entry
exports.createEntry = async (req, res) => {
  try {
    const { title, content, createdForDate } = req.body;
    const entry = new JournalEntry({
      title,
      content,
      user: req.user.userId,
      createdForDate: createdForDate ? new Date(createdForDate) : new Date()
    });
    await entry.save();
    
    // Update user streak data
    await updateUserStreak(req.user.userId, entry.createdForDate, entry.createdAt);
    
    // Summarize and update
    try {
      if (process.env.LLM_ENGINE === 'langgraph') {
        await summarizeGraph.invoke({ 
          type: 'journal',
          userId: req.user.userId, 
          entryId: entry._id.toString(), 
          title: entry.title, 
          content: entry.content 
        });
        const refreshed = await JournalEntry.findById(entry._id);
        return res.status(201).json(refreshed);
      }
      const summaryData = await summarizeJournalEntry(content);
      
      // Store the original createdAt to ensure it's not modified
      // This is critical for the streak system which relies on createdAt dates
      const originalCreatedAt = entry.createdAt;
      
      Object.assign(entry, summaryData);
      
      // Ensure createdAt is preserved before saving
      entry.createdAt = originalCreatedAt;
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
            date: entry.createdForDate,
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
    console.error('Error in createEntry:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all journal entries for the authenticated user
exports.getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error in getEntries:', err);
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
    console.error('Error in getEntryById:', err);
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
    
    // Store the original createdAt to ensure it's not modified
    // This is critical for the streak system which relies on createdAt dates
    const originalCreatedAt = entry.createdAt;
    
    // Summarize and update
    try {
      if (process.env.LLM_ENGINE === 'langgraph') {
        await summarizeGraph.invoke({ 
          type: 'journal',
          userId: req.user.userId, 
          entryId: entry._id.toString(), 
          title: entry.title, 
          content: entry.content 
        });
        const refreshed = await JournalEntry.findById(entry._id);
        return res.json(refreshed);
      }
      const summaryData = await summarizeJournalEntry(content);
      Object.assign(entry, summaryData);
      
      // Ensure createdAt is preserved before saving
      entry.createdAt = originalCreatedAt;
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
            date: entry.createdForDate,
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
    console.error('Error in updateEntry:', err);
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
    console.error('Error in deleteEntry:', err);
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
      createdForDate: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Error in getTodaysEntries:', err);
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
      createdForDate: { $gte: start, $lte: end },
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
    const todayIST = moment().tz('Asia/Kolkata').startOf('day');
    const trend = [];
    
    for (let i = 6; i >= 0; i--) {
      // Get the IST day
      const dayIST = todayIST.clone().subtract(i, 'days');
      // Start of IST day in UTC
      const startUTC = dayIST.clone().tz('Asia/Kolkata').startOf('day').utc().toDate();
      // End of IST day in UTC
      const endUTC = dayIST.clone().tz('Asia/Kolkata').endOf('day').utc().toDate();

      const entry = await JournalEntry.findOne({
        user: userId,
        createdForDate: { $gte: startUTC, $lte: endUTC },
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
    
    // Get user data with streak information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if streak should be reset (if last entry was more than 1 day ago)
    let currentStreak = user.streakData.currentStreak;
    if (user.streakData.lastEntryDate) {
      const lastEntryDate = new Date(user.streakData.lastEntryDate);
      lastEntryDate.setHours(0, 0, 0, 0);
      
      const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // If more than 1 day has passed since last entry, reset streak
      if (daysSinceLastEntry > 1) {
        currentStreak = 0;
        user.streakData.currentStreak = 0;
        user.streakData.lastEntryDate = null;
        user.streakData.lastEntryCreatedAt = null;
        await user.save();
      }
    }
    
    // Calculate this week's entries
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEntries = await JournalEntry.find({ 
      user: userId,
      createdForDate: { $gte: weekStart }
    }).select('createdForDate').lean();
    
    // Count unique days this week
    const uniqueDaysThisWeek = new Set();
    thisWeekEntries.forEach(entry => {
      const entryDate = new Date(entry.createdForDate);
      entryDate.setHours(0, 0, 0, 0);
      uniqueDaysThisWeek.add(entryDate.toISOString().split('T')[0]);
    });
    
    res.json({
      current: currentStreak,
      longest: user.streakData.longestStreak,
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