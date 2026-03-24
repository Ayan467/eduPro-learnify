const express = require('express');
const router = express.Router();
const { enrollCourse, getMyCourses } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, enrollCourse);
router.get('/my-courses', protect, getMyCourses);

module.exports = router;
