const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdForDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  embedding: {
    type: [Number],
    default: undefined // Only set if embedding is generated
  },
  mood: {
    type: String,
    default: null // e.g., "Reflective", "Angry", "Hopeful"
  },
  summary: {
    type: String,
    default: null // 1-line reflective summary
  },
  sentiment: {
    type: String,
    default: null // e.g., "positive", "neutral", "negative"
  },
  intent: {
    type: String,
    default: null // e.g., "planning", "reflection", "venting"
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);