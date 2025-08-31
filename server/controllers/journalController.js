const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const moment = require('moment-timezone');
const { summarizeGraph } = require('../langgraph/summarizeGraph');
const { deleteVectorByEntryId } = require('../utils/vectorCleanup');

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
    
    // Summarize and update using LangGraph
    try {
      await summarizeGraph.invoke({ 
        type: 'journal',
        userId: req.user.userId, 
        entryId: entry._id.toString(), 
        title: entry.title, 
        content: entry.content 
      });
      const refreshed = await JournalEntry.findById(entry._id);
      return res.status(201).json(refreshed);
    } catch (aiErr) {
      // Log but don't block user
      console.error('Summarization error:', aiErr.message);
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
    
    // Summarize and update using LangGraph
    try {
      await summarizeGraph.invoke({ 
        type: 'journal',
        userId: req.user.userId, 
        entryId: entry._id.toString(), 
        title: entry.title, 
        content: entry.content 
      });
      const refreshed = await JournalEntry.findById(entry._id);
      return res.json(refreshed);
    } catch (aiErr) {
      // Log but don't block user
      console.error('Summarization error:', aiErr.message);
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
    
    // Delete corresponding vector from Pinecone
    try {
      await deleteVectorByEntryId(entry._id.toString());
    } catch (vectorError) {
      console.error('Failed to delete vector:', vectorError);
      // Log error but don't fail the deletion
    }
    
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