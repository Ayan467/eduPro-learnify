const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllStudents, toggleStudentStatus, getCourseStats, verifyInstructor } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/students', getAllStudents);
router.put('/students/:id/toggle', toggleStudentStatus);
router.get('/courses/stats', getCourseStats);
router.put('/instructors/:id/verify', verifyInstructor);

module.exports = router;
