import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { getSocket } from '../../services/socket';
import API from '../../services/api';
import HelpBot from './HelpBot';

const NavItem = ({ to, icon, label, badge }) => (
  <NavLink to={to} className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-white shadow-md'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`}
    style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #1D9E75, #185FA5)' } : {}}>
    <span className="text-base">{icon}</span>
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

const StudentNav = ({ unread }) => (<>
  <NavItem to="/dashboard" icon="📊" label="Dashboard" />
  <NavItem to="/courses" icon="📚" label="Courses" />
  <NavItem to="/wishlist" icon="💖" label="Wishlist" />
  <NavItem to="/certificates" icon="🏆" label="Certificates" />
  <NavItem to="/notifications" icon="🔔" label="Notifications" badge={unread} />
</>);

const InstructorNav = ({ unread }) => (<>
  <NavItem to="/instructor/dashboard" icon="📊" label="Dashboard" />
  <NavItem to="/instructor/courses" icon="📚" label="My Courses" />
  <NavItem to="/instructor/students" icon="👥" label="Students" />
  <NavItem to="/instructor/earnings" icon="💰" label="Earnings" />
  <NavItem to="/notifications" icon="🔔" label="Notifications" badge={unread} />
</>);

const AdminNav = ({ unread }) => (<>
  <NavItem to="/admin/dashboard" icon="📊" label="Dashboard" />
  <NavItem to="/admin/courses" icon="📚" label="Courses" />
  <NavItem to="/admin/students" icon="👥" label="Students" />
  <NavItem to="/admin/instructors" icon="🎓" label="Instructors" />
  <NavItem to="/admin/upload" icon="⬆️" label="Upload Content" />
  <NavItem to="/notifications" icon="🔔" label="Notifications" badge={unread} />
</>);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    API.get('/notifications').then(({ data }) => setUnread(data.unreadCount)).catch(() => {});
    const socket = getSocket();
    if (!socket) return;
    socket.on('notification', () => setUnread(c => c + 1));
    return () => socket.off('notification');
  }, []);

  const roleColors = { student: '#1D9E75', instructor: '#185FA5', admin: '#7c3aed' };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
      {/* Premium Sidebar */}
      <aside className="w-60 flex flex-col shrink-0"
        style={{ background: 'white', borderRight: '1px solid #e2e8f0', boxShadow: '4px 0 20px rgba(0,0,0,0.04)' }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              Learn<span className="gradient-text">ify</span>
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#f8fafc' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: roleColors[user?.role] || '#1D9E75' }} />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {user?.role === 'admin' ? 'Admin Panel' : user?.role === 'instructor' ? 'Instructor' : 'Student'}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto px-0">
          {user?.role === 'admin' && <AdminNav unread={unread} />}
          {user?.role === 'instructor' && <InstructorNav unread={unread} />}
          {user?.role === 'student' && <StudentNav unread={unread} />}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full mt-2 text-xs text-red-400 hover:text-red-600 transition-colors py-1.5 rounded-lg hover:bg-red-50 font-medium">
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>

      {user?.role === 'student' && <HelpBot />}
    </div>
  );
}
