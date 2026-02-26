const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const parseTopics = (topics) => {
  if (Array.isArray(topics)) {
    return topics.map((topic) => String(topic).trim()).filter(Boolean);
  }

  if (typeof topics === 'string') {
    return topics
      .split(',')
      .map((topic) => topic.trim())
      .filter(Boolean);
  }

  return [];
};

const buildFilters = (query) => {
  const filters = {};

  if (query.platform) filters.platform = query.platform;
  if (query.difficulty) filters.difficulty = query.difficulty;
  if (query.status) filters.status = query.status;
  if (typeof query.revision !== 'undefined' && query.revision !== '') {
    filters.revision = query.revision === 'true';
  }

  return filters;
};

const getProblems = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const problems = await Problem.find({ user: req.userId, ...filters }).sort({ createdAt: -1 });
    return res.status(200).json(problems);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    const problem = await Problem.findOne({ _id: id, user: req.userId });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    return res.status(200).json(problem);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProblem = async (req, res) => {
  try {
    const {
      title,
      platform,
      link,
      difficulty,
      rating,
      topics,
      status,
      revision,
      notes,
      createdAt,
    } = req.body;

    if (!title || !platform || !link || !difficulty) {
      return res.status(400).json({ message: 'title, platform, link and difficulty are required' });
    }

    const problem = await Problem.create({
      user: req.userId,
      title,
      platform,
      link,
      difficulty,
      rating: typeof rating === 'number' ? rating : Number(rating || 0),
      topics: parseTopics(topics),
      status: status || 'Unsolved',
      revision: Boolean(revision),
      notes: notes || '',
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });

    return res.status(201).json(problem);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    const existingProblem = await Problem.findOne({ _id: id, user: req.userId });
    if (!existingProblem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const updates = { ...req.body };

    if (typeof updates.topics !== 'undefined') {
      updates.topics = parseTopics(updates.topics);
    }

    if (typeof updates.rating !== 'undefined') {
      updates.rating = Number(updates.rating);
    }

    if (typeof updates.revision !== 'undefined') {
      updates.revision = updates.revision === true || updates.revision === 'true';
    }

    if (typeof updates.createdAt !== 'undefined') {
      updates.createdAt = new Date(updates.createdAt);
    }

    const updatedProblem = await Problem.findOneAndUpdate(
      { _id: id, user: req.userId },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json(updatedProblem);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    const deleted = await Problem.findOneAndDelete({ _id: id, user: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    return res.status(200).json({ message: 'Problem deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
};
