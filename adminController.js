const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const recentEnrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title price')
      .sort('-createdAt').limit(10);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentEnrollments,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'student' };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const students = await User.find(query).skip((page - 1) * limit).limit(Number(limit)).sort('-createdAt');
    const total = await User.countDocuments(query);
    res.json({ success: true, students, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/students/:id/toggle
const toggleStudentStatus = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    student.isActive = !student.isActive;
    await student.save();
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/courses/stats
const getCourseStats = async (req, res) => {
  try {
    const courses = await Course.find()
      .select('title enrolledCount isPublished createdAt price')
      .sort('-enrolledCount');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// PUT /api/admin/instructors/:id/verify
const verifyInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id);
    if (!instructor || instructor.role !== 'instructor')
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    instructor.isVerified = true;
    await instructor.save();
    res.json({ success: true, message: 'Instructor verified', instructor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboardStats, getAllStudents, toggleStudentStatus, getCourseStats, verifyInstructor };
