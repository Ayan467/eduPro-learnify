const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

// Instructor or Admin
const instructorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'instructor' || req.user.role === 'admin')) return next();
  return res.status(403).json({ success: false, message: 'Instructor access required' });
};

// Check course ownership (instructor owns course or admin)
const ownsCourse = async (req, res, next) => {
  const Course = require('../models/Course');
  const course = await Course.findById(req.params.id || req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  if (req.user.role === 'admin' || course.instructor.toString() === req.user._id.toString()) {
    req.course = course;
    return next();
  }
  return res.status(403).json({ success: false, message: 'You do not own this course' });
};

// Check enrollment
const checkEnrollment = async (req, res, next) => {
  const Enrollment = require('../models/Enrollment');
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
  req.enrollment = enrollment;
  next();
};

module.exports = { protect, adminOnly, instructorOrAdmin, ownsCourse, checkEnrollment };
