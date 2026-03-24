const express = require('express');
const router = express.Router();
const {
  getDashboard, getMyCourses, createCourse, updateCourse, deleteCourse,
  addModule, addLecture, getCourseStudents, getCourseReviews, getEarnings,
} = require('../controllers/instructorController');
const { protect, instructorOrAdmin, ownsCourse } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All instructor routes require auth + instructor/admin role
router.use(protect, instructorOrAdmin);

router.get('/dashboard', getDashboard);
router.get('/earnings', getEarnings);

// Course management
router.get('/courses', getMyCourses);
router.post('/courses', upload.single('thumbnail'), createCourse);
router.put('/courses/:id', ownsCourse, upload.single('thumbnail'), updateCourse);
router.delete('/courses/:id', ownsCourse, deleteCourse);

// Curriculum
router.post('/courses/:id/modules', ownsCourse, addModule);
router.post('/courses/:id/modules/:moduleIndex/lectures', ownsCourse, upload.single('video'), addLecture);

// Students & Reviews
router.get('/courses/:id/students', ownsCourse, getCourseStudents);
router.get('/courses/:id/reviews', ownsCourse, getCourseReviews);

module.exports = router;
