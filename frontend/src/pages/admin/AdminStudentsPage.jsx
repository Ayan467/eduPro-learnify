import { useEffect, useState } from 'react';
import { Spinner, EmptyState, Badge } from '../../components/common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null); // for detail modal

  const fetchStudents = (s = '', p = 1) => {
    setLoading(true);
    API.get('/admin/students', { params: { search: s, page: p, limit: 20 } })
      .then(({ data }) => {
        setStudents(data.students.filter(u => u.role === 'student'));
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
    fetchStudents(e.target.value, 1);
  };

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/students/${id}/toggle`);
      toast.success('Student status updated');
      fetchStudents(search, page);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Students</h1>
          <p className="text-gray-500 text-sm mt-1">{total} students registered</p>
        </div>
        <input className="input-field max-w-xs" placeholder="🔍 Search by name or email..."
          value={search} onChange={handleSearch} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{students.filter(s => s.isActive).length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{students.filter(s => !s.isActive).length}</p>
          <p className="text-xs text-gray-500 mt-1">Deactivated</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <EmptyState icon="👥" title="No students found" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Enrolled Courses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Certificates</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center text-sm font-semibold text-primary-dark shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800">{s.enrolledCourses?.length || 0}</span>
                    <span className="text-xs text-gray-400 ml-1">courses</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800">{s.certificates?.length || 0}</span>
                    <span className="text-xs text-gray-400 ml-1">earned</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {s.lastLogin
                      ? new Date(s.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : 'Never'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setSelected(s)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">Details</button>
                      <button onClick={() => handleToggle(s._id)}
                        className={`text-xs font-medium ${s.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {total > 20 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Showing {students.length} of {total}</p>
              <div className="flex gap-2">
                <button disabled={page === 1}
                  onClick={() => { const p = page - 1; setPage(p); fetchStudents(search, p); }}
                  className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">← Prev</button>
                <button disabled={students.length < 20}
                  onClick={() => { const p = page + 1; setPage(p); fetchStudents(search, p); }}
                  className="btn-secondary text-xs px-3 py-1 disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Student Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center text-xl font-bold text-primary-dark">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                  selected.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>{selected.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{selected.enrolledCourses?.length || 0}</p>
                <p className="text-xs text-gray-500">Enrolled Courses</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{selected.certificates?.length || 0}</p>
                <p className="text-xs text-gray-500">Certificates</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-gray-700">
                  {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Joined</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs font-semibold text-gray-700">
                  {selected.lastLogin
                    ? new Date(selected.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Never'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Last Login</p>
              </div>
            </div>
            {selected.bio && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{selected.bio}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { handleToggle(selected._id); setSelected(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selected.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}>
                {selected.isActive ? 'Deactivate Student' : 'Activate Student'}
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary px-4">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
