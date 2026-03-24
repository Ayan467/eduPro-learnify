import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, EmptyState, ProgressBar } from '../../components/common/UI';
import API from '../../services/api';

export default function InstructorStudentsPage() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/instructor/courses').then(({ data }) => {
      setCourses(data.courses);
      if (!selectedCourse && data.courses.length > 0) setSelectedCourse(data.courses[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    API.get(`/instructor/courses/${selectedCourse}/students`)
      .then(({ data }) => setStudents(data.students))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCourse]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Students</h1>
        <p className="text-gray-500 text-sm mt-1">Track student progress across your courses</p>
      </div>

      {/* Course selector */}
      <div className="mb-5">
        <select className="input-field max-w-xs" value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <EmptyState icon="👥" title="No students yet" description="Students who enroll in this course will appear here" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 text-sm font-medium text-gray-500">
            {students.length} students enrolled
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Enrolled</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Last Active</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-xs font-semibold text-primary-dark shrink-0">
                        {s.student?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.student?.name}</p>
                        <p className="text-xs text-gray-400">{s.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar value={s.completionPercentage || 0} />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{s.completionPercentage || 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {new Date(s.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {s.student?.lastLogin
                      ? new Date(s.student.lastLogin).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    {s.isCompleted ? (
                      <span className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full font-medium">✅ Completed</span>
                    ) : s.completionPercentage > 0 ? (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">⏳ In Progress</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">🔴 Not Started</span>
                    )}
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
