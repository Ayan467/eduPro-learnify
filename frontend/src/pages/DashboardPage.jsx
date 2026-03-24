import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import CourseCard from '../components/course/CourseCard';
import { Skeleton } from '../components/common/UI';
import API from '../services/api';

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="bg-white rounded-2xl p-5 relative overflow-hidden transition-all hover:-translate-y-0.5"
    style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
    <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6 opacity-10"
      style={{ background: color || '#1D9E75' }} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
        {sub && <p className="text-xs mt-1 font-medium" style={{ color: color || '#1D9E75' }}>{sub}</p>}
      </div>
      <span className="text-2xl">{icon}</span>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const { myCourses, fetchMyCourses } = useCourse();
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const notifications = [
    { type: 'success', text: 'You scored 90% on React Basics quiz', time: '2 hours ago', icon: '🎯' },
    { type: 'info', text: 'New course added: Docker & DevOps', time: 'Yesterday', icon: '📚' },
    { type: 'warning', text: 'Complete a module to earn certificate', time: '2 days ago', icon: '🏆' },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const enrollments = await fetchMyCourses();
      if (enrollments) {
        const map = {};
        await Promise.all(enrollments.map(async (e) => {
          try {
            const { data } = await API.get(`/progress/${e.course._id}`);
            map[e.course._id] = data.progress?.completionPercentage || 0;
          } catch {}
        }));
        setProgressMap(map);
      }
      setLoading(false);
    };
    load();
  }, []);

  const completedCount = Object.values(progressMap).filter(v => v === 100).length;
  const totalHours = Object.values(progressMap).reduce((acc, pct) => acc + Math.round((pct / 100) * 2), 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Hero greeting */}
      <div className="rounded-3xl p-8 mb-8 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b, #0f4c3a)' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 80% 50%, #1D9E75, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-green-300 text-sm font-semibold mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-400">Continue your learning journey today.</p>
          <button onClick={() => navigate('/courses')}
            className="mt-4 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
            Browse Courses →
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Enrolled" value={myCourses.length} sub="Active courses" icon="📚" color="#1D9E75" />
        <StatCard label="Hours Learned" value={totalHours} sub={totalHours > 0 ? "Keep going!" : "Start learning"} icon="⏱️" color="#185FA5" />
        <StatCard label="Certificates" value={completedCount} sub="Earned" icon="🏆" color="#f59e0b" />
        <StatCard label="In Progress" value={myCourses.length - completedCount} sub="Active" icon="🎯" color="#7c3aed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Sora, sans-serif' }}>Continue Learning</h2>
            <button onClick={() => navigate('/courses')} className="text-sm font-medium" style={{ color: '#1D9E75' }}>
              Browse all →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[1,2].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}
            </div>
          ) : myCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center" style={{ border: '1px solid #e2e8f0' }}>
              <p className="text-4xl mb-3">📖</p>
              <p className="font-semibold text-gray-700 mb-1">No courses yet</p>
              <p className="text-sm text-gray-400 mb-4">Start your learning journey today!</p>
              <button onClick={() => navigate('/courses')} className="btn-primary text-sm px-6 py-2">Browse Courses</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myCourses.slice(0, 4).map(e => (
                <CourseCard key={e._id} course={e.course} enrolled progress={progressMap[e.course._id] || 0} />
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Notifications</h2>
          <div className="space-y-3">
            {notifications.map((n, i) => {
              const styles = {
                success: { bg: '#F0FDF4', border: '#86efac', text: '#166534' },
                info: { bg: '#EFF6FF', border: '#93c5fd', text: '#1e40af' },
                warning: { bg: '#FFFBEB', border: '#fcd34d', text: '#92400e' },
              };
              const s = styles[n.type];
              return (
                <div key={i} className="rounded-xl p-3.5 flex gap-3"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <span className="text-lg shrink-0">{n.icon}</span>
                  <div>
                    <p className="text-sm font-medium" style={{ color: s.text }}>{n.text}</p>
                    <p className="text-xs opacity-70 mt-0.5" style={{ color: s.text }}>{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress summary */}
          {myCourses.length > 0 && (
            <div className="mt-4 bg-white rounded-2xl p-4" style={{ border: '1px solid #e2e8f0' }}>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Overall Progress</h3>
              <div className="space-y-3">
                {myCourses.slice(0, 3).map(e => (
                  <div key={e._id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 truncate flex-1 mr-2">{e.course?.title}</span>
                      <span className="font-semibold" style={{ color: '#1D9E75' }}>{progressMap[e.course?._id] || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${progressMap[e.course?._id] || 0}%`, background: 'linear-gradient(90deg, #1D9E75, #185FA5)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
