const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const moment = require('moment-timezone');

// Set or update user's journaling goal
exports.setGoal = async (req, res) => {
  try {
    const { targetDays, reminderTime, reminderEnabled } = req.body;
    const userId = req.user.userId;

    if (!targetDays || targetDays < 1 || targetDays > 365) {
      return res.status(400).json({ 
        message: 'Target days must be between 1 and 365' 
      });
    }

    // Validate reminder time format (HH:MM with 30-minute intervals)
    if (reminderTime && !/^([01]?[0-9]|2[0-3]):(00|30)$/.test(reminderTime)) {
      return res.status(400).json({ 
        message: 'Reminder time must be in HH:MM format with 30-minute intervals (e.g., 09:00, 09:30)' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate end date
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + targetDays - 1);
    endDate.setHours(23, 59, 59, 999);

    // Prepare new goal data
    const newGoalData = {
      targetDays,
      startDate: today,
      endDate,
      isActive: true,
      lastReminderSent: null,
      reminderTime: reminderTime || "09:00",
      reminderEnabled: reminderEnabled !== undefined ? reminderEnabled : true
    };

    // Use updateOne to avoid root-level validation
    await User.updateOne(
      { _id: userId },
      { $set: { goalData: newGoalData } }
    );

    // Return the new goal data
    res.json({
      message: 'Goal set successfully',
      goal: newGoalData
    });
  } catch (err) {
    console.error('Error setting goal:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user's current goal
exports.getGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.goalData.isActive) {
      return res.json({ goal: null });
    }

    // Calculate progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(user.goalData.startDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(user.goalData.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Count entries made during the goal period
    const entries = await JournalEntry.find({
      user: userId,
      createdForDate: { $gte: startDate, $lte: endDate }
    });

    const daysWithEntries = new Set();
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdForDate);
      entryDate.setHours(0, 0, 0, 0);
      daysWithEntries.add(entryDate.toISOString().split('T')[0]);
    });

    const progress = daysWithEntries.size;
    const isCompleted = progress >= user.goalData.targetDays;
    const isExpired = today > endDate;

    // Check if goal should be deactivated
    if (isCompleted || isExpired) {
      user.goalData.isActive = false;
      await user.save();
    }

    res.json({
      goal: {
        ...user.goalData.toObject(),
        progress,
        isCompleted,
        isExpired,
        remainingDays: Math.max(0, user.goalData.targetDays - progress)
      }
    });
  } catch (err) {
    console.error('Error getting goal:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel current goal
exports.cancelGoal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use updateOne to avoid root-level validation
    await User.updateOne(
      { _id: userId },
      { $set: { "goalData.isActive": false } }
    );

    res.json({ message: 'Goal cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling goal:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update reminder settings
exports.updateReminderSettings = async (req, res) => {
  try {
    const { reminderTime, reminderEnabled } = req.body;
    const userId = req.user.userId;

    // Validate reminder time format (HH:MM with 30-minute intervals)
    if (reminderTime && !/^([01]?[0-9]|2[0-3]):(00|30)$/.test(reminderTime)) {
      return res.status(400).json({ 
        message: 'Reminder time must be in HH:MM format with 30-minute intervals (e.g., 09:00, 09:30)' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update reminder settings
    if (reminderTime !== undefined) {
      user.goalData.reminderTime = reminderTime;
    }
    if (reminderEnabled !== undefined) {
      user.goalData.reminderEnabled = reminderEnabled;
    }

    await user.save();

    res.json({
      message: 'Reminder settings updated successfully',
      reminderSettings: {
        reminderTime: user.goalData.reminderTime,
        reminderEnabled: user.goalData.reminderEnabled
      }
    });
  } catch (err) {
    console.error('Error updating reminder settings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check if user needs a reminder (for daily cron job)
exports.checkReminders = async (currentTime = new Date()) => {
  try {
    // Convert current time to IST
    const nowIST = moment(currentTime).tz('Asia/Kolkata');
    const todayIST = nowIST.clone().startOf('day').toDate();

    // Find users with active goals who haven't made an entry today
    const users = await User.find({
      'goalData.isActive': true,
      'goalData.reminderEnabled': true
    });

    const usersNeedingReminders = [];

    for (const user of users) {
      // Check if user has made an entry today (IST)
      const startOfDay = todayIST;
      const endOfDay = moment(todayIST).endOf('day').toDate();

      const todayEntry = await JournalEntry.findOne({
        user: user._id,
        createdForDate: { $gte: startOfDay, $lte: endOfDay }
      });

      // Check if reminder was already sent today
      const lastReminder = user.goalData.lastReminderSent;
      const reminderSentToday = lastReminder && 
        moment(lastReminder).tz('Asia/Kolkata').isSame(nowIST, 'day');

      // Check if it's time to send reminder based on user's preference (IST hour only)
      const userReminderTime = user.goalData.reminderTime || "21:00";
      const [reminderHour, reminderMinute] = userReminderTime.split(':').map(Number);
      const currentHour = nowIST.hour();
      const currentMinute = nowIST.minute();
      
      // Check if current time is within 30 minutes of the reminder time
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const reminderTimeInMinutes = reminderHour * 60 + reminderMinute;
      const timeDifference = Math.abs(currentTimeInMinutes - reminderTimeInMinutes);
      const isReminderTime = timeDifference <= 30; // Within 30 minutes of reminder time

      if (!todayEntry && !reminderSentToday && isReminderTime) {
        usersNeedingReminders.push(user);
      }
    }

    return usersNeedingReminders;
  } catch (err) {
    console.error('Error checking reminders:', err);
    return [];
  }
};

// Mark reminder as sent
exports.markReminderSent = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.goalData.lastReminderSent = new Date();
      await user.save();
    }
  } catch (err) {
    console.error('Error marking reminder sent:', err);
  }
}; 