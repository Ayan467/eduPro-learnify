import { useEffect, useState } from 'react';
import { Spinner, EmptyState, Badge } from '../../components/common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchInstructors = () => {
    setLoading(true);
    API.get('/admin/students', { params: { role: 'instructor', search } })
      .then(({ data }) => setInstructors(data.students.filter(u => u.role === 'instructor')))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInstructors(); }, []);

  const handleToggle = async (id) => {
    try {
      await API.put(`/admin/students/${id}/toggle`);
      toast.success('Instructor status updated');
      fetchInstructors();
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async (id) => {
    try {
      await API.put(`/admin/instructors/${id}/verify`);
      toast.success('Instructor verified!');
      fetchInstructors();
    } catch { toast.error('Failed to verify'); }
  };

  const filtered = instructors.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Instructors</h1>
          <p className="text-gray-500 text-sm">{filtered.length} instructors</p>
        </div>
        <input className="input-field max-w-xs" placeholder="🔍 Search instructors..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🎓" title="No instructors yet" description="Instructors who register will appear here" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Expertise</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Courses</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Students</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(inst => (
                <tr key={inst._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-semibold text-secondary shrink-0">
                        {inst.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800">{inst.name}</p>
                          {inst.isVerified && <span className="text-xs text-primary">✓ Verified</span>}
                        </div>
                        <p className="text-xs text-gray-400">{inst.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(inst.expertise || []).slice(0, 2).map((e, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e}</span>
                      ))}
                      {(inst.expertise || []).length === 0 && <span className="text-xs text-gray-400">—</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-700">{inst.totalCourses || 0}</td>
                  <td className="px-5 py-3 text-gray-700">{inst.totalStudents || 0}</td>
                  <td className="px-5 py-3">
                    <Badge variant={inst.isActive ? 'success' : 'danger'}>
                      {inst.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-3">
                      {!inst.isVerified && (
                        <button onClick={() => handleVerify(inst._id)}
                          className="text-xs text-primary hover:text-primary-dark font-medium">Verify</button>
                      )}
                      <button onClick={() => handleToggle(inst._id)}
                        className={`text-xs font-medium ${inst.isActive ? 'text-red-500 hover:text-red-700' : 'text-primary hover:text-primary-dark'}`}>
                        {inst.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
