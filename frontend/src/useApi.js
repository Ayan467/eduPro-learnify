import { useState, useEffect } from 'react';
import API from '../services/api';

// Fetch progress for a course
export const useProgress = (courseId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    API.get(`/progress/${courseId}`)
      .then(({ data }) => setProgress(data.progress))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const markComplete = async (lectureId) => {
    const { data } = await API.post(`/progress/${courseId}/lecture/${lectureId}`);
    setProgress(data.progress);
    return data.progress;
  };

  return { progress, loading, markComplete };
};

// Fetch single course
export const useCourseDetail = (courseId) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    API.get(`/courses/${courseId}`)
      .then(({ data }) => setCourse(data.course))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  return { course, loading };
};

// Fetch quiz for course
export const useQuizzes = (courseId) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    API.get(`/quizzes/${courseId}`)
      .then(({ data }) => setQuizzes(data.quizzes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  return { quizzes, loading };
};

// Fetch certificates
export const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/certificates/my')
      .then(({ data }) => setCertificates(data.certificates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { certificates, loading };
};
