const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['CodeChef', 'Codeforces', 'LeetCode', 'GFG'],
      required: true,
      index: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    topics: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Solved', 'Attempted', 'Unsolved'],
      default: 'Unsolved',
      index: true,
    },
    revision: {
      type: Boolean,
      default: false,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Problem', problemSchema);
