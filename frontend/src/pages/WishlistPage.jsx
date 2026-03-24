import { useEffect, useState } from 'react';
import { Spinner, EmptyState } from '../components/common/UI';
import CourseCard from '../components/course/CourseCard';
import PaymentModal from '../components/course/PaymentModal';
import { useCourse } from '../context/CourseContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingCourse, setPayingCourse] = useState(null);
  const { myCourses, fetchMyCourses, enrollCourse } = useCourse();

  const enrolledIds = new Set(myCourses.map(e => e.course?._id));

  const fetchWishlist = () => {
    API.get('/auth/wishlist')
      .then(({ data }) => setWishlist(data.wishlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); fetchMyCourses(); }, []);

  const removeFromWishlist = async (courseId) => {
    await API.post(`/auth/wishlist/${courseId}`);
    setWishlist(prev => prev.filter(c => c._id !== courseId));
    toast.success('Removed from wishlist');
  };

  const handleEnroll = async (course) => {
    if (course.isPremium) setPayingCourse(course);
    else await enrollCourse(course._id);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <p className="text-gray-500 text-sm">{wishlist.length} saved course{wishlist.length !== 1 ? 's' : ''}</p>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState icon="💖" title="Your wishlist is empty" description="Browse courses and save the ones you like!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlist.map(course => (
            <div key={course._id} className="relative">
              <button onClick={() => removeFromWishlist(course._id)}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-red-400 hover:bg-red-50 shadow-sm text-xs">
                ♥
              </button>
              <CourseCard course={course} enrolled={enrolledIds.has(course._id)} onEnroll={handleEnroll} />
            </div>
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
