const Course = require('../models/Course');

// GET /api/courses
const getCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    // Only add filter if not empty and not 'All'
    if (category && category !== '' && category !== 'All') query.category = category;
    if (level && level !== '' && level !== 'All') query.level = level;
    if (search && search.trim() !== '') query.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Course.countDocuments(query);
    res.json({ success: true, courses, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/courses/:id
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name avatar bio');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses (admin only)
const createCourse = async (req, res) => {
  try {
    const courseData = { ...req.body, instructor: req.user._id, instructorName: req.user.name };
    if (req.file) courseData.thumbnail = `/uploads/images/${req.file.filename}`;
    const course = await Course.create(courseData);
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/courses/:id
const updateCourse = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/images/${req.file.filename}`;
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses/:id/modules
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

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, addModule };
