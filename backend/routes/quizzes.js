const express = require('express');
const router = express.Router();
const { getQuizzesByCourse, getQuiz, createQuiz, submitQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:courseId', protect, getQuizzesByCourse);
router.get('/single/:quizId', protect, getQuiz);
router.post('/', protect, adminOnly, createQuiz);
router.post('/:quizId/submit', protect, submitQuiz);
router.delete('/:quizId', protect, adminOnly, deleteQuiz);

module.exports = router;
