const Quiz = require('../models/Quiz');
const Progress = require('../models/Progress');

// GET /api/quizzes/:courseId
const getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).select('-questions.correctAnswer');
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quizzes/single/:quizId
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).select('-questions.correctAnswer');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/quizzes (admin)
const createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/quizzes/:quizId/submit
const submitQuiz = async (req, res) => {
  const { answers } = req.body; // { questionIndex: selectedOption }
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return { questionIndex: i, selected: answers[i], correct: q.correctAnswer, isCorrect, explanation: q.explanation };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save to progress
    let progress = await Progress.findOne({ student: req.user._id, course: quiz.course });
    if (progress) {
      progress.quizResults.push({ quizId: quiz._id, score, passed });
      await progress.save();
    }

    res.json({ success: true, score, passed, correct, total: quiz.questions.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/quizzes/:quizId (admin)
const deleteQuiz = async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.quizId);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getQuizzesByCourse, getQuiz, createQuiz, submitQuiz, deleteQuiz };
