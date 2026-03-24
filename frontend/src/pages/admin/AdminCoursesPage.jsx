import { useEffect, useState } from 'react';
import { Badge, Spinner, EmptyState } from '../../components/common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', description: '', category: 'Frontend', level: 'Beginner',
  price: 0, isPremium: false, language: 'English',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchCourses = () => {
    setLoading(true);
    API.get('/admin/courses/stats')
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required');
    setSaving(true);
    try {
      if (editId) {
        await API.put(`/courses/${editId}`, form);
        toast.success('Course updated!');
      } else {
        await API.post('/courses', { ...form, isPublished: true });
        toast.success('Course created & published!');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      await API.put(`/courses/${course._id}`, { isPublished: !course.isPublished });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published!');
      fetchCourses();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (c) => {
    setForm({
      title: c.title, description: c.description || '',
      category: c.category || 'Frontend', level: c.level || 'Beginner',
      price: c.price || 0, isPremium: c.isPremium || false,
    });
    setEditId(c._id); setShowForm(true);
  };

  const filtered = courses.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} total courses</p>
        </div>
        <div className="flex gap-3">
          <input className="input-field max-w-xs" placeholder="🔍 Search..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="btn-primary whitespace-nowrap">+ Add Course</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Courses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{courses.filter(c => c.isPublished).length}</p>
          <p className="text-xs text-gray-500 mt-1">Published</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{courses.filter(c => !c.isPublished).length}</p>
          <p className="text-xs text-gray-500 mt-1">Draft / Pending</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course Title *</label>
                <input className="input-field" placeholder="e.g. React Mastery"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                <textarea className="input-field resize-none" rows={3}
                  placeholder="What will students learn?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select className="input-field" value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['Frontend','Backend','AI/ML','Database','DevOps','Mobile','Design'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
                  <select className="input-field" value={form.level}
                    onChange={e => setForm({ ...form, level: e.target.value })}>
                    {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
                  <input type="number" min="0" className="input-field"
                    value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.isPremium}
                      onChange={e => setForm({ ...form, isPremium: e.target.checked })}
                      className="w-4 h-4 accent-primary" />
                    Premium Course
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editId ? 'Update Course' : 'Create & Publish'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <h3 className="text-gray-700 font-medium">No courses found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Students</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-800">{course.title}</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{course.category || '—'}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{course.level || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-600 text-xs">{course.instructorName || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-gray-800">{course.enrolledCount || 0}</span>
                    <span className="text-xs text-gray-400 ml-1">students</span>
                  </td>
                  <td className="px-5 py-3 text-gray-700 font-medium">
                    {course.price > 0
                      ? `₹${((course.enrolledCount || 0) * course.price).toLocaleString()}`
                      : <span className="text-xs text-gray-400">Free</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      course.isPublished ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {course.isPublished ? '✅ Published' : '⏳ Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(course)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button onClick={() => handleTogglePublish(course)}
                        className={`text-xs font-medium ${course.isPublished ? 'text-amber-600 hover:text-amber-800' : 'text-green-600 hover:text-green-800'}`}>
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDelete(course._id, course.title)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium">🗑 Delete</button>
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
