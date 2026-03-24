const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // in minutes
  description: { type: String },
  materials: [{ name: String, url: String }],
  order: { type: Number, default: 0 },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  lectures: [lectureSchema],
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorName: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
  modules: [moduleSchema],
  tags: [String],
  totalDuration: { type: Number, default: 0 },
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  language: { type: String, default: 'English' },
  prerequisites: [{ type: String }],
  whatYouLearn: [{ type: String }],
  revenue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
