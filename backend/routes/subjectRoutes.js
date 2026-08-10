const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');

router.use(requireAuth); // every route below requires a valid JWT

router.get('/', getSubjects);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
