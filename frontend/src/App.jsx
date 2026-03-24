import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Common pages
import Layout from './components/common/Layout';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import CertificatesPage from './pages/CertificatesPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';

// Instructor pages
import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage';
import InstructorCoursesPage from './pages/instructor/InstructorCoursesPage';
import InstructorStudentsPage from './pages/instructor/InstructorStudentsPage';
import InstructorEarningsPage from './pages/instructor/InstructorEarningsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminInstructorsPage from './pages/admin/AdminInstructorsPage';
import AdminUploadPage from './pages/admin/AdminUploadPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'instructor') return <Navigate to="/instructor/dashboard" />;
  return <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={user ? <RoleRedirect /> : <LoginPage />} />
      <Route path="/register" element={user ? <RoleRedirect /> : <RegisterPage />} />

      {/* Shared routes for all authenticated users */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Student routes */}
      <Route element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/learn/:courseId" element={<LearnPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/chat/:courseId" element={<ChatPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Instructor routes */}
      <Route element={<ProtectedRoute roles={['instructor']}><Layout /></ProtectedRoute>}>
        <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
        <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
        <Route path="/instructor/students" element={<InstructorStudentsPage />} />
        <Route path="/instructor/students/:courseId" element={<InstructorStudentsPage />} />
        <Route path="/instructor/earnings" element={<InstructorEarningsPage />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/students" element={<AdminStudentsPage />} />
        <Route path="/admin/instructors" element={<AdminInstructorsPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <AppRoutes />
      </CourseProvider>
    </AuthProvider>
  );
}
