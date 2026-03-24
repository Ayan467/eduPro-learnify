const Discussion = require('../models/Discussion');

// GET /api/discussions/:courseId
const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ course: req.params.courseId })
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar role')
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, discussions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/discussions/:courseId
const createDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.create({
      course: req.params.courseId,
      author: req.user._id,
      title: req.body.title,
      content: req.body.content,
    });
    await discussion.populate('author', 'name avatar role');
    res.status(201).json({ success: true, discussion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/discussions/:discussionId/reply
const addReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });
    discussion.replies.push({ author: req.user._id, content: req.body.content });
    await discussion.save();
    await discussion.populate('replies.author', 'name avatar role');
    res.json({ success: true, discussion });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDiscussions, createDiscussion, addReply };
