import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Spinner, ProgressBar, Badge } from '../../components/common/UI';
import API from '../../services/api';

export default function InstructorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/instructor/dashboard')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { stats, courses, recentEnrollments, monthlyRevenue } = data || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Instructor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your teaching overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Courses" value={stats?.totalCourses || 0} icon="📚" sub={`${stats?.publishedCourses || 0} published`} />
        <StatCard label="Total Students" value={stats?.totalStudents?.toLocaleString() || 0} icon="👥" />
        <StatCard label="Total Earnings" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`} icon="💰" />
        <StatCard label="Avg Rating" value={`${stats?.avgRating || 0} ⭐`} icon="🌟" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* My Courses Summary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">My Courses</h2>
            <button onClick={() => navigate('/instructor/courses')}
              className="text-sm text-primary hover:underline">View all →</button>
          </div>
          <div className="space-y-3">
            {courses?.slice(0, 4).map(c => (
              <div key={c._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-xl shrink-0">📚</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400">{c.enrolledCount} students · ⭐ {c.rating || 0}</p>
                </div>
                <Badge variant={c.isPublished ? 'success' : 'warning'}>
                  {c.isPublished ? 'Live' : 'Draft'}
                </Badge>
              </div>
            ))}
            {(!courses || courses.length === 0) && (
              <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
                No courses yet. <button onClick={() => navigate('/instructor/courses')} className="text-primary hover:underline">Create one →</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Students</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {recentEnrollments?.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No enrollments yet</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentEnrollments?.slice(0, 6).map(e => (
                  <div key={e._id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-xs font-semibold text-primary-dark shrink-0">
                      {e.student?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.student?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{e.course?.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">
                      {new Date(e.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      {monthlyRevenue?.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-end gap-3 h-32">
              {monthlyRevenue.map((m, i) => {
                const max = Math.max(...monthlyRevenue.map(x => x.revenue));
                const height = max > 0 ? Math.round((m.revenue / max) * 100) : 0;
                const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <p className="text-xs text-gray-500">₹{(m.revenue/1000).toFixed(1)}K</p>
                    <div className="w-full bg-primary rounded-t-md transition-all" style={{ height: `${height}%`, minHeight: '4px' }} />
                    <p className="text-xs text-gray-400">{months[m._id.month]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
