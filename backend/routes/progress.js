const express = require('express');
const router = express.Router();
const { getProgress, markLectureComplete, getAllProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/all', protect, getAllProgress);
router.get('/:courseId', protect, getProgress);
router.post('/:courseId/lecture/:lectureId', protect, markLectureComplete);

module.exports = router;
