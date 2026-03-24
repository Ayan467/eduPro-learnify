const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentName: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorName: { type: String, required: true },
  completionDate: { type: Date, default: Date.now },
  certificateUrl: { type: String },
  uniqueId: { type: String, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
