const express = require('express');
const router = express.Router();
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse, addModule } = require('../controllers/courseController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, adminOnly, upload.single('thumbnail'), createCourse);
router.put('/:id', protect, adminOnly, upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);
router.post('/:id/modules', protect, adminOnly, addModule);

// POST /api/courses/:id/modules/:moduleIndex/materials
router.post('/:id/modules/:moduleIndex/materials', protect, adminOnly, upload.single('material'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const mod = course.modules[req.params.moduleIndex];
    if (!mod) return res.status(404).json({ success: false, message: 'Module not found' });
    const materialUrl = req.file ? `/uploads/materials/${req.file.filename}` : req.body.url || '';
    if (mod.lectures.length > 0) {
      mod.lectures[mod.lectures.length - 1].materials = mod.lectures[mod.lectures.length - 1].materials || [];
      mod.lectures[mod.lectures.length - 1].materials.push({ name: req.body.name || req.file?.originalname || 'Material', url: materialUrl });
    }
    await course.save();
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
