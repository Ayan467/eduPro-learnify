import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from '../components/common/UI';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // quizId is courseId here for listing
    API.get(`/quizzes/${quizId}`)
      .then(({ data }) => { setQuizzes(data.quizzes); if (data.quizzes.length) setActiveQuiz(data.quizzes[0]); })
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSelect = (qIdx, optIdx) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < activeQuiz.questions.length)
      return toast.error('Please answer all questions');
    setSubmitting(true);
    try {
      const { data } = await API.post(`/quizzes/${activeQuiz._id}/submit`, { answers });
      setResult(data);
      if (data.passed) toast.success(`Quiz passed! Score: ${data.score}%`);
      else toast.error(`Quiz failed. Score: ${data.score}%. Try again!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => { setAnswers({}); setResult(null); };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!quizzes.length) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-3">📝</p>
      <h3 className="text-gray-700 font-medium">No quizzes available for this course yet</h3>
      <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
        ← Back
      </button>

      {/* Quiz selector */}
      {quizzes.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {quizzes.map((q, i) => (
            <button key={q._id} onClick={() => { setActiveQuiz(q); setAnswers({}); setResult(null); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeQuiz?._id === q._id ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              Module {i + 1} Quiz
            </button>
          ))}
        </div>
      )}

      {activeQuiz && (
        <div>
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <h1 className="text-lg font-bold text-gray-800">{activeQuiz.title}</h1>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>📋 {activeQuiz.questions.length} questions</span>
              <span>⏱ {activeQuiz.timeLimit} minutes</span>
              <span>🎯 Pass: {activeQuiz.passingScore}%</span>
            </div>
          </div>

          {/* Result banner */}
          {result && (
            <div className={`rounded-xl p-4 mb-5 text-center ${result.passed ? 'bg-primary-light border border-primary' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-2xl font-bold mb-1" style={{ color: result.passed ? '#0F6E56' : '#dc2626' }}>
                {result.score}%
              </p>
              <p className={`font-medium ${result.passed ? 'text-primary-dark' : 'text-red-600'}`}>
                {result.passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'} — {result.correct}/{result.total} correct
              </p>
              {!result.passed && (
                <button onClick={handleRetry} className="btn-primary mt-3 text-sm">Try Again</button>
              )}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {activeQuiz.questions.map((q, qi) => (
              <div key={qi} className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="font-medium text-gray-800 mb-4">Q{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    let style = 'border-gray-200 hover:border-primary hover:bg-primary-light text-gray-700';
                    if (answers[qi] === oi && !result) style = 'border-primary bg-primary-light text-primary-dark font-medium';
                    if (result) {
                      const res = result.results[qi];
                      if (oi === res.correct) style = 'border-primary bg-primary-light text-primary-dark font-medium';
                      else if (oi === answers[qi] && !res.isCorrect) style = 'border-red-400 bg-red-50 text-red-600';
                      else style = 'border-gray-200 text-gray-500';
                    }
                    return (
                      <button key={oi} onClick={() => handleSelect(qi, oi)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${style}`}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {result?.results[qi]?.explanation && (
                  <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                    💡 {result.results[qi].explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!result && (
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full btn-primary py-3 mt-5 flex items-center justify-center gap-2">
              {submitting ? <Spinner size="sm" /> : null}
              Submit Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
