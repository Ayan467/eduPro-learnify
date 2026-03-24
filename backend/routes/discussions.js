const express = require('express');
const router = express.Router();
const { getDiscussions, createDiscussion, addReply } = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.get('/:courseId', protect, getDiscussions);
router.post('/:courseId', protect, createDiscussion);
router.post('/:discussionId/reply', protect, addReply);

module.exports = router;
