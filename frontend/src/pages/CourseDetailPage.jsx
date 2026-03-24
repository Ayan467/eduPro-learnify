import { useParams, useNavigate } from 'react-router-dom';
import { useCourseDetail } from '../hooks/useApi';
import { useCourse } from '../context/CourseContext';
import { Badge, ProgressBar, Spinner } from '../components/common/UI';
import PaymentModal from '../components/course/PaymentModal';
import { useState } from 'react';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { course, loading } = useCourseDetail(id);
  const { myCourses, enrollCourse, fetchMyCourses } = useCourse();
  const [payingCourse, setPayingCourse] = useState(null);
  const [openModule, setOpenModule] = useState(0);

  const isEnrolled = myCourses.some(e => e.course?._id === id);

  const handleEnroll = () => {
    if (course.isPremium) setPayingCourse(course);
    else enrollCourse(course._id);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!course) return <p className="text-center text-gray-500 py-20">Course not found</p>;

  const totalLectures = course.modules?.reduce((a, m) => a + m.lectures.length, 0) || 0;

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
        ← Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="bg-primary-light h-48 flex items-center justify-center text-6xl">📚</div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="info">{course.category}</Badge>
            <Badge>{course.level}</Badge>
            {course.isPremium ? <Badge variant="premium">₹{course.price}</Badge> : <Badge variant="success">Free</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <p className="text-sm text-gray-500 mb-4">Instructor: <span className="font-medium">{course.instructorName}</span></p>

          <div className="flex gap-4 text-sm text-gray-500 mb-5">
            <span>📦 {course.modules?.length || 0} modules</span>
            <span>🎬 {totalLectures} lectures</span>
            <span>👥 {course.enrolledCount} enrolled</span>
          </div>

          {isEnrolled ? (
            <button onClick={() => navigate(`/learn/${course._id}`)} className="btn-primary px-6 py-3">
              Continue Learning →
            </button>
          ) : (
            <button onClick={handleEnroll} className="btn-primary px-6 py-3">
              {course.isPremium ? `Enroll for ₹${course.price}` : 'Enroll for Free'}
            </button>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Course Curriculum</h2>
        <div className="space-y-3">
          {course.modules?.map((mod, i) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setOpenModule(openModule === i ? -1 : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-800">{mod.title}</p>
                  <p className="text-xs text-gray-500">{mod.lectures.length} lectures</p>
                </div>
                <span className="text-gray-400">{openModule === i ? '▲' : '▼'}</span>
              </button>
              {openModule === i && (
                <div className="border-t border-gray-100">
                  {mod.lectures.map((lec, j) => (
                    <div key={j} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">▶</span>
                      <span>{lec.title}</span>
                      <span className="ml-auto text-xs text-gray-400">{lec.duration}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {payingCourse && (
        <PaymentModal course={payingCourse}
          onSuccess={() => { setPayingCourse(null); fetchMyCourses(); }}
          onClose={() => setPayingCourse(null)} />
      )}
    </div>
  );
}
