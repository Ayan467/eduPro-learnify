import { useEffect, useState } from 'react';
import { StatCard, Spinner } from '../../components/common/UI';
import { ProgressBar } from '../../components/common/UI';
import API from '../../services/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/stats')
      .then(({ data }) => {
        setStats(data.stats);
        setRecentEnrollments(data.recentEnrollments);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Students" value={stats?.totalStudents?.toLocaleString() || 0} icon="👥" />
        <StatCard label="Total Courses" value={stats?.totalCourses || 0} icon="📚" />
        <StatCard label="Total Enrollments" value={stats?.totalEnrollments?.toLocaleString() || 0} icon="📝" />
        <StatCard label="Total Revenue" value={`₹${((stats?.totalRevenue || 0) / 100000).toFixed(1)}L`} icon="💰" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Enrollments</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEnrollments.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{e.student?.name}</p>
                    <p className="text-xs text-gray-400">{e.student?.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{e.course?.title}</td>
                  <td className="px-5 py-3 text-gray-700">
                    {e.course?.price > 0 ? `₹${e.course.price}` : 'Free'}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(e.enrolledAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.isCompleted ? 'bg-primary-light text-primary-dark' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {e.isCompleted ? '✅ Completed' : '⏳ Active'}
                    </span>
                  </td>
                </tr>
              ))}
              {recentEnrollments.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-10">No enrollments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
