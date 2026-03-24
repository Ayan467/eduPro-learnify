const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

// GET /api/reviews/:courseId
const getCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name avatar')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments({ course: req.params.courseId });
    res.json({ success: true, reviews, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews/:courseId
const createReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    // Must be enrolled to review
    const enrolled = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
    if (!enrolled) return res.status(403).json({ success: false, message: 'You must be enrolled to review' });

    const existing = await Review.findOne({ student: req.user._id, course: req.params.courseId });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this course' });

    const review = await Review.create({
      course: req.params.courseId,
      student: req.user._id,
      studentName: req.user.name,
      rating,
      comment,
      isVerifiedPurchase: !!enrolled.paymentId,
    });

    // Notify instructor
    const course = await Course.findById(req.params.courseId);
    if (course) {
      await Notification.create({
        recipient: course.instructor,
        type: 'review',
        title: 'New review on your course',
        message: `${req.user.name} rated "${course.title}" ${rating}/5 stars.`,
        link: `/instructor/courses/${course._id}/reviews`,
      });
    }

    await review.populate('student', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:reviewId
const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, student: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found or not yours' });
    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, student: req.user._id });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found or not yours' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews/:reviewId/helpful
const markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const idx = review.helpful.indexOf(req.user._id);
    if (idx > -1) review.helpful.splice(idx, 1);
    else review.helpful.push(req.user._id);
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCourseReviews, createReview, updateReview, deleteReview, markHelpful };
