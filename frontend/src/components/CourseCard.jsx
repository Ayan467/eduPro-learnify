import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  Frontend: { bg: '#EFF6FF', text: '#1d4ed8', dot: '#3b82f6' },
  Backend: { bg: '#F0FDF4', text: '#15803d', dot: '#22c55e' },
  'AI/ML': { bg: '#FFF7ED', text: '#c2410c', dot: '#f97316' },
  Database: { bg: '#FAF5FF', text: '#7e22ce', dot: '#a855f7' },
  DevOps: { bg: '#FFF1F2', text: '#be123c', dot: '#f43f5e' },
  default: { bg: '#F8FAFC', text: '#475569', dot: '#94a3b8' },
};

const CATEGORY_EMOJI = {
  Frontend: '⚛️', Backend: '🟢', 'AI/ML': '🤖', Database: '🗄️', DevOps: '🐋', default: '📚'
};

export default function CourseCard({ course, progress, onEnroll, enrolled }) {
  const navigate = useNavigate();
  const colors = CATEGORY_COLORS[course.category] || CATEGORY_COLORS.default;
  const emoji = CATEGORY_EMOJI[course.category] || CATEGORY_EMOJI.default;

  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}>

      {/* Thumbnail */}
      <div className="h-36 flex items-center justify-center text-5xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.bg}, white)` }}
        onClick={() => navigate(`/courses/${course._id}`)}>
        <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 70% 70%, ${colors.dot}, transparent 60%)` }} />
        <span className="relative z-10 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
        {/* Free badge */}
        {!course.isPremium && (
          <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #1D9E75, #059669)' }}>FREE</div>
        )}
      </div>

      <div className="p-4">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: colors.bg, color: colors.text }}>
            {course.category}
          </span>
          <span className="text-xs text-gray-400">{course.level}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors"
          style={{ fontFamily: 'Sora, sans-serif' }}
          onClick={() => navigate(`/courses/${course._id}`)}>
          {course.title}
        </h3>
        <p className="text-xs text-gray-400 mb-3">{course.instructorName}</p>

        {/* Rating & Students */}
        {course.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <span key={s} className="text-xs" style={{ color: s <= Math.round(course.rating) ? '#f59e0b' : '#e5e7eb' }}>★</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">{course.rating}</span>
          </div>
        )}

        {/* Progress bar if enrolled */}
        {enrolled && progress !== undefined && (
          <div className="mb-3">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1D9E75, #185FA5)' }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            {course.isPremium
              ? <span className="font-bold text-gray-900">₹{course.price}</span>
              : <span className="font-bold" style={{ color: '#1D9E75' }}>Free</span>}
          </div>
          {enrolled ? (
            <button onClick={() => navigate(`/learn/${course._id}`)}
              className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              Continue →
            </button>
          ) : (
            <button onClick={() => onEnroll?.(course)}
              className="text-xs font-bold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              {course.isPremium ? 'Enroll' : 'Start Free'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
