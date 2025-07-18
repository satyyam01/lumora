const mongoose = require('mongoose');

const memorySnapshotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['chat', 'journal'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'source' // Will reference either ChatSession or JournalEntry
  },
  embedding: {
    type: [Number],
    default: undefined
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MemorySnapshot', memorySnapshotSchema); 