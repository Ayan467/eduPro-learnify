const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// POST /api/enroll
const enrollCourse = async (req, res) => {
  const { courseId, paymentId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const exists = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (exists) return res.status(400).json({ success: false, message: 'Already enrolled' });

    if (course.isPremium && !paymentId)
      return res.status(400).json({ success: false, message: 'Payment required for premium course' });

    const enrollment = await Enrollment.create({
      student: req.user._id, course: courseId, paymentId: paymentId || null
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: courseId } });

    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/enroll/my-courses
const getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title thumbnail instructorName category level')
      .sort('-enrolledAt');
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { enrollCourse, getMyCourses };
