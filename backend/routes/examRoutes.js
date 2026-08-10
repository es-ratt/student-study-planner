const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');

router.use(requireAuth);

router.get('/', getExams);
router.post('/', createExam);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
