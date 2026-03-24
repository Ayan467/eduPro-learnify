import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Spinner, EmptyState } from '../../components/common/UI';
import API from '../../services/api';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', description: '', category: 'Frontend', level: 'Beginner',
  price: 0, isPremium: false, language: 'English',
  whatYouLearn: '', prerequisites: '',
};

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [lectureForm, setLectureForm] = useState({ title: '', duration: 30 });
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const navigate = useNavigate();

  const fetchCourses = () => {
    setLoading(true);
    API.get('/instructor/courses')
      .then(({ data }) => setCourses(data.courses))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.description) return toast.error('Title and description are required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        whatYouLearn: form.whatYouLearn.split('\n').filter(Boolean),
        prerequisites: form.prerequisites.split('\n').filter(Boolean),
      };
      if (editId) {
        await API.put(`/instructor/courses/${editId}`, payload);
        toast.success('Course updated!');
      } else {
        await API.post('/instructor/courses', payload);
        toast.success('Course created! Admin will review and publish it.');
      }
      setShowForm(false); setForm(emptyForm); setEditId(null);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await API.delete(`/instructor/courses/${id}`);
      toast.success('Course deleted'); fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleEdit = (c) => {
    setForm({
      title: c.title, description: c.description, category: c.category, level: c.level,
      price: c.price, isPremium: c.isPremium, language: c.language || 'English',
      whatYouLearn: (c.whatYouLearn || []).join('\n'),
      prerequisites: (c.prerequisites || []).join('\n'),
    });
    setEditId(c._id); setShowForm(true);
  };

  const addModule = async (courseId) => {
    if (!moduleForm.title) return toast.error('Module title required');
    try {
      await API.post(`/instructor/courses/${courseId}/modules`, moduleForm);
      toast.success('Module added!'); setModuleForm({ title: '', description: '' }); fetchCourses();
    } catch (err) { toast.error('Failed to add module'); }
  };

  const addLecture = async (courseId, moduleIdx) => {
    if (!lectureForm.title) return toast.error('Lecture title required');
    try {
      await API.post(`/instructor/courses/${courseId}/modules/${moduleIdx}/lectures`, lectureForm);
      toast.success('Lecture added!'); setLectureForm({ title: '', duration: 30 }); fetchCourses();
    } catch (err) { toast.error('Failed to add lecture'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
          <p className="text-gray-500 text-sm">{courses.length} courses</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="btn-primary">+ Create Course</button>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editId ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <input className="input-field" placeholder="Course Title *"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <textarea className="input-field resize-none" rows={3} placeholder="Description *"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Frontend','Backend','AI/ML','Database','DevOps','Mobile','Design'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select className="input-field" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 items-center">
                <input type="number" className="input-field" placeholder="Price (₹)"
                  value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                  <input type="checkbox" checked={form.isPremium}
                    onChange={e => setForm({ ...form, isPremium: e.target.checked })} />
                  Premium Course
                </label>
              </div>
              <textarea className="input-field resize-none text-sm" rows={3}
                placeholder="What students will learn (one per line)"
                value={form.whatYouLearn} onChange={e => setForm({ ...form, whatYouLearn: e.target.value })} />
              <textarea className="input-field resize-none text-sm" rows={2}
                placeholder="Prerequisites (one per line)"
                value={form.prerequisites} onChange={e => setForm({ ...form, prerequisites: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Spinner size="sm" /> : null}
                {editId ? 'Update' : 'Submit for Review'}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <EmptyState icon="📚" title="No courses yet" description="Create your first course and start teaching!" />
      ) : (
        <div className="space-y-4">
          {courses.map(c => (
            <div key={c._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Course header */}
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-light rounded-lg flex items-center justify-center text-2xl shrink-0">📚</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{c.title}</h3>
                    <Badge variant={c.isPublished ? 'success' : 'warning'}>
                      {c.isPublished ? 'Published' : 'Pending Review'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.enrolledCount} students · ⭐ {c.rating || 0} · {c.modules?.length || 0} modules ·
                    {c.price > 0 ? ` ₹${c.price}` : ' Free'}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => navigate(`/instructor/courses/${c._id}/students`)}
                    className="btn-secondary text-xs px-3 py-1.5">Students</button>
                  <button onClick={() => handleEdit(c)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2">Edit</button>
                  <button onClick={() => setExpandedCourse(expandedCourse === c._id ? null : c._id)}
                    className="text-xs text-primary hover:text-primary-dark font-medium px-2">
                    {expandedCourse === c._id ? 'Collapse' : 'Curriculum'}
                  </button>
                  <button onClick={() => handleDelete(c._id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2">Delete</button>
                </div>
              </div>

              {/* Expandable curriculum */}
              {expandedCourse === c._id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Course Curriculum</h4>

                  {/* Existing modules */}
                  {c.modules?.map((mod, mi) => (
                    <div key={mi} className="bg-white rounded-lg border border-gray-200 mb-3 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                        <p className="font-medium text-sm text-gray-800">Module {mi+1}: {mod.title}</p>
                        <button onClick={() => setActiveModuleIdx(mi)}
                          className="text-xs text-primary">+ Add Lecture</button>
                      </div>
                      {mod.lectures?.map((lec, li) => (
                        <div key={li} className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 border-b border-gray-50 last:border-0">
                          <span className="text-gray-400">▶</span>
                          <span className="flex-1">{lec.title}</span>
                          <span className="text-gray-400">{lec.duration}m</span>
                        </div>
                      ))}
                      {activeModuleIdx === mi && (
                        <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                          <input className="input-field text-xs flex-1" placeholder="Lecture title"
                            value={lectureForm.title} onChange={e => setLectureForm({ ...lectureForm, title: e.target.value })} />
                          <input type="number" className="input-field text-xs w-20" placeholder="Min"
                            value={lectureForm.duration} onChange={e => setLectureForm({ ...lectureForm, duration: Number(e.target.value) })} />
                          <button onClick={() => addLecture(c._id, mi)} className="btn-primary text-xs px-3">Add</button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add module form */}
                  <div className="bg-white rounded-lg border border-dashed border-gray-300 p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">+ Add New Module</p>
                    <div className="flex gap-2">
                      <input className="input-field text-xs flex-1" placeholder="Module title"
                        value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} />
                      <button onClick={() => addModule(c._id)} className="btn-primary text-xs px-3">Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
