const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: false
  },
  streakData: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastEntryDate: {
      type: Date,
      default: null
    },
    lastEntryCreatedAt: {
      type: Date,
      default: null
    }
  },
  goalData: {
    targetDays: {
      type: Number,
      default: 7
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: false
    },
    lastReminderSent: {
      type: Date,
      default: null
    },
    reminderTime: {
      type: String,
      default: "09:00" // Default to 9 AM
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 