const express = require('express');
const {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', createProblem);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

module.exports = router;
