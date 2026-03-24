import { useEffect, useState } from 'react';
import { Spinner, EmptyState } from '../components/common/UI';
import API from '../services/api';
import toast from 'react-hot-toast';

const TYPE_ICONS = {
  enrollment: '📝', quiz_result: '✅', course_complete: '🏆',
  new_course: '📚', payment: '💳', review: '⭐', message: '💬', announcement: '📢',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    API.get('/notifications')
      .then(({ data }) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const deleteNotif = async (id) => {
    await API.delete(`/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n._id !== id));
    toast.success('Notification deleted');
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-500 text-sm">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-primary hover:underline font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id}
              className={`bg-white rounded-xl border p-4 flex gap-4 transition-colors cursor-pointer group
                ${n.isRead ? 'border-gray-200' : 'border-primary-light bg-primary-light/30'}`}
              onClick={() => !n.isRead && markRead(n._id)}>
              <div className="text-xl shrink-0">{TYPE_ICONS[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? 'text-gray-700' : 'font-semibold text-gray-800'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 text-lg transition-opacity shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
