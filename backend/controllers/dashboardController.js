const Problem = require('../models/Problem');

const getDashboardStats = async (req, res) => {
  try {
    const userMatch = { user: req.userId };

    const [totalSolved, platformStats, difficultyStats] = await Promise.all([
      Problem.countDocuments({ ...userMatch, status: 'Solved' }),
      Problem.aggregate([
        { $match: userMatch },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
        { $project: { _id: 0, platform: '$_id', count: 1 } },
      ]),
      Problem.aggregate([
        { $match: userMatch },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
        { $project: { _id: 0, difficulty: '$_id', count: 1 } },
      ]),
    ]);

    return res.status(200).json({
      totalSolved,
      platformStats,
      difficultyStats,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
};
