const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// GET /api/instructor/dashboard
const getDashboard = async (req, res) => {
  try {
    const instructorId = req.user._id;

    // Get all courses by this instructor
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(c => c._id);

    // Total students enrolled across all courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar createdAt')
      .populate('course', 'title price')
      .sort('-enrolledAt')
      .limit(10);

    const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds } });

    // Revenue: sum of payments for instructor's courses
    const revenueAgg = await Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'success', paidAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$paidAt' }, year: { $year: '$paidAt' } }, revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Average rating across all courses
    const avgRating = courses.length > 0
      ? (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)
      : 0;

    // Update instructor stats in User model
    await User.findByIdAndUpdate(instructorId, {
      totalStudents, totalRevenue, totalCourses: courses.length,
      rating: Number(avgRating),
    });

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue,
        avgRating,
        publishedCourses: courses.filter(c => c.isPublished).length,
        draftCourses: courses.filter(c => !c.isPublished).length,
      },
      courses,
      recentEnrollments: enrollments,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/instructor/courses
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/instructor/courses
const createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id,
      instructorName: req.user.name,
    };
    if (req.file) courseData.thumbnail = `/uploads/images/${req.file.filename}`;
    const course = await Course.create(courseData);

    // Notify admin about new course pending review
    const admins = await User.find({ role: 'admin' });
    await Promise.all(admins.map(admin =>
      Notification.create({
        recipient: admin._id, type: 'new_course',
        title: 'New course submitted for review',
        message: `${req.user.name} submitted "${course.title}" for review.`,
        link: `/admin/courses`,
      })
    ));

    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/instructor/courses/:id
const updateCourse = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/images/${req.file.filename}`;
    // Instructors cannot change isPublished directly; that's admin approval
    delete updates.isPublished;
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/instructor/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.enrolledCount > 0)
      return res.status(400).json({ success: false, message: 'Cannot delete a course with enrolled students' });
    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/instructor/courses/:id/modules
const addModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    course.modules.push({ ...req.body, order: course.modules.length });
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/instructor/courses/:id/modules/:moduleIndex/lectures
const addLecture = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const mod = course.modules[req.params.moduleIndex];
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });

    const lectureData = { ...req.body, order: mod.lectures.length };
    if (req.file) lectureData.videoUrl = `/uploads/videos/${req.file.filename}`;

    mod.lectures.push(lectureData);
    // Recalculate total duration
    course.totalDuration = course.modules.reduce((acc, m) =>
      acc + m.lectures.reduce((a, l) => a + (l.duration || 0), 0), 0);
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/instructor/courses/:id/students
const getCourseStudents = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('student', 'name email avatar createdAt lastLogin')
      .sort('-enrolledAt');

    // Get progress for each student
    const progresses = await Progress.find({ course: req.params.id });
    const progressMap = {};
    progresses.forEach(p => { progressMap[p.student.toString()] = p.completionPercentage; });

    const students = enrollments.map(e => ({
      ...e.toObject(),
      completionPercentage: progressMap[e.student._id.toString()] || 0,
    }));

    res.json({ success: true, students, total: students.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/instructor/courses/:id/reviews
const getCourseReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.id })
      .populate('student', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/instructor/earnings
const getEarnings = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).select('_id title');
    const courseIds = courses.map(c => c._id);

    const payments = await Payment.find({ course: { $in: courseIds }, status: 'success' })
      .populate('course', 'title price')
      .populate('student', 'name email')
      .sort('-paidAt');

    // Per-course breakdown
    const breakdown = await Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'success' } },
      { $group: { _id: '$course', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: { total: 1, count: 1, 'course.title': 1, 'course.price': 1 } },
    ]);

    const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

    res.json({ success: true, totalEarnings, payments, breakdown });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDashboard, getMyCourses, createCourse, updateCourse, deleteCourse,
  addModule, addLecture, getCourseStudents, getCourseReviews, getEarnings,
};
