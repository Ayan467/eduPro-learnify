const express = require('express');
const router = express.Router();
const { getCourseReviews, createReview, updateReview, deleteReview, markHelpful } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:courseId', getCourseReviews);
router.post('/:courseId', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);
router.post('/:reviewId/helpful', protect, markHelpful);

module.exports = router;
