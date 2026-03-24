import { useEffect, useState } from 'react';
import { useCourse } from '../context/CourseContext';
import CourseCard from '../components/course/CourseCard';
import PaymentModal from '../components/course/PaymentModal';
import { Skeleton, EmptyState } from '../components/common/UI';

const CATEGORIES = ['All', 'Frontend', 'Backend', 'AI/ML', 'Database', 'DevOps'];
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CoursesPage() {
  const { courses, myCourses, loading, fetchCourses, fetchMyCourses, enrollCourse } = useCourse();
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [search, setSearch] = useState('');
  const [payingCourse, setPayingCourse] = useState(null);

  const enrolledIds = new Set(myCourses.map(e => e.course?._id));

  useEffect(() => {
    fetchCourses({
      category: category !== 'All' ? category : '',
      level: level !== 'All' ? level : '',
    });
    fetchMyCourses();
  }, [category, level]);

  const handleEnroll = async (course) => {
    if (course.isPremium) setPayingCourse(course);
    else await enrollCourse(course._id);
  };

  const filtered = courses.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="text-gray-500 mt-1">Explore {courses.length} available courses</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input className="input-field max-w-xs" placeholder="🔍 Search courses..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === c
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{c}</button>
          ))}
        </div>
        <select value={level} onChange={e => setLevel(e.target.value)}
          className="input-field w-auto text-sm">
          {LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No courses found" description="Try different filters or search terms" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(course => (
            <CourseCard key={course._id} course={course}
              enrolled={enrolledIds.has(course._id)}
              onEnroll={handleEnroll} />
          ))}
        </div>
      )}

      {payingCourse && (
        <PaymentModal course={payingCourse}
          onSuccess={() => { setPayingCourse(null); fetchMyCourses(); }}
          onClose={() => setPayingCourse(null)} />
      )}
    </div>
  );
}
