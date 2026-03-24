const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/misc';
    if (file.mimetype.startsWith('image/')) folder = 'uploads/images';
    else if (file.mimetype.startsWith('video/')) folder = 'uploads/videos';
    else if (file.mimetype === 'application/pdf') folder = 'uploads/materials';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg','image/jpg','image/png','image/webp','video/mp4','video/webm','application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not supported'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

module.exports = upload;
