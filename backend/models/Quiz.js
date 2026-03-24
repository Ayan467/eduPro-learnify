const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  moduleIndex: { type: Number, required: true },
  questions: [questionSchema],
  passingScore: { type: Number, default: 60 }, // percentage
  timeLimit: { type: Number, default: 30 }, // minutes
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
