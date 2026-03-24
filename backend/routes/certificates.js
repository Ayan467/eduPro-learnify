const express = require('express');
const router = express.Router();
const { getMyCertificates, downloadCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyCertificates);
router.get('/:id/download', protect, downloadCertificate);

module.exports = router;
