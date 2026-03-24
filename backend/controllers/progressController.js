const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const User = require('../models/User');

// GET /api/progress/:courseId
const getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    if (!progress) {
      progress = await Progress.create({ student: req.user._id, course: req.params.courseId });
    }
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/progress/:courseId/lecture/:lectureId
const markLectureComplete = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let progress = await Progress.findOne({ student: req.user._id, course: req.params.courseId });
    if (!progress) progress = new Progress({ student: req.user._id, course: req.params.courseId });

    // Add lecture if not already completed
    if (!progress.completedLectures.includes(req.params.lectureId)) {
      progress.completedLectures.push(req.params.lectureId);
    }

    // Calculate total lectures across all modules
    const totalLectures = course.modules.reduce((acc, mod) => acc + mod.lectures.length, 0);
    progress.completionPercentage = totalLectures > 0
      ? Math.round((progress.completedLectures.length / totalLectures) * 100)
      : 0;
    progress.lastAccessedAt = new Date();
    await progress.save();

    // ─── AUTO CERTIFICATE on 100% completion ───
    if (progress.completionPercentage === 100) {
      const existing = await Certificate.findOne({
        student: req.user._id,
        course: req.params.courseId,
      });

      if (!existing) {
        // Generate unique certificate ID
        const uniqueId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const cert = await Certificate.create({
          student: req.user._id,
          course: req.params.courseId,
          studentName: req.user.name,
          courseName: course.title,
          instructorName: course.instructorName,
          completionDate: new Date(),
          uniqueId,
        });

        // Mark enrollment as completed
        await Enrollment.findOneAndUpdate(
          { student: req.user._id, course: req.params.courseId },
          { isCompleted: true, completedAt: new Date() }
        );

        // Add to student's certificates list
        await User.findByIdAndUpdate(req.user._id, {
          $addToSet: { completedCourses: req.params.courseId, certificates: cert._id }
        });

        console.log(`🏆 Certificate generated for ${req.user.name} — ${course.title}`);
      }
    }

    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/progress/all
const getAllProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({ student: req.user._id })
      .populate('course', 'title thumbnail');
    res.json({ success: true, progressList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProgress, markLectureComplete, getAllProgress };
