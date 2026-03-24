import { createContext, useContext, useState, useCallback } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';

const CourseContext = createContext(null);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await API.get('/courses', { params });
      setCourses(data.courses);
      return data;
    } catch (err) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyCourses = useCallback(async () => {
    try {
      const { data } = await API.get('/enroll/my-courses');
      setMyCourses(data.enrollments);
      return data.enrollments;
    } catch (err) {
      toast.error('Failed to fetch your courses');
    }
  }, []);

  const enrollCourse = async (courseId, paymentId = null) => {
    try {
      const { data } = await API.post('/enroll', { courseId, paymentId });
      toast.success('Enrolled successfully!');
      fetchMyCourses();
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
      throw err;
    }
  };

  return (
    <CourseContext.Provider value={{ courses, myCourses, loading, fetchCourses, fetchMyCourses, enrollCourse }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => useContext(CourseContext);
