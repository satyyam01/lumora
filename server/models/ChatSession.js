const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    default: null
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  closed: {
    type: Boolean,
    default: false
  },
  summary: {
    type: String,
    default: null
  },
  insights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemorySnapshot'
  }]
});

module.exports = mongoose.model('ChatSession', chatSessionSchema); 