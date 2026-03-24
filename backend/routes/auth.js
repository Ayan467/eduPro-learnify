const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, toggleWishlist, getWishlist,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], register);
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, upload.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/wishlist/:courseId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);
module.exports = router;
