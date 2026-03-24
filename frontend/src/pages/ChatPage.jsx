import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { useCourseDetail } from '../hooks/useApi';
import API from '../services/api';
import { Spinner } from '../components/common/UI';

export default function ChatPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course } = useCourseDetail(courseId);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const bottomRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit('join_course', courseId);

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Load discussions
    API.get(`/discussions/${courseId}`)
      .then(({ data }) => setDiscussions(data.discussions))
      .catch(() => {});

    return () => {
      socket.off('new_message');
      socket.emit('leave_course', courseId);
    };
  }, [courseId, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { courseId, content: input.trim() });
    setMessages(prev => [...prev, {
      _id: Date.now(),
      senderName: user.name,
      senderRole: user.role,
      content: input.trim(),
      createdAt: new Date(),
      isMine: true,
    }]);
    setInput('');
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const createDiscussion = async () => {
    if (!newTopic.trim()) return;
    try {
      const { data } = await API.post(`/discussions/${courseId}`, { title: newTopic, content: newTopicContent });
      setDiscussions(prev => [data.discussion, ...prev]);
      setNewTopic(''); setNewTopicContent(''); setShowNewTopic(false);
    } catch {}
  };

  return (
    <div className="flex gap-5 max-w-5xl">
      {/* Live Chat */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden h-[calc(100vh-120px)]">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800 text-sm">Live Chat</h2>
            <p className="text-xs text-gray-400">{course?.title}</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => {
            const isMine = msg.isMine || msg.senderName === user.name;
            return (
              <div key={msg._id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && (
                  <p className="text-xs text-gray-400 mb-1 px-1">
                    {msg.senderName} {msg.senderRole === 'admin' ? '👨‍🏫' : ''}
                  </p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${
                  isMine ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-gray-300 mt-0.5 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress}
            placeholder="Type a message..." className="flex-1 input-field" />
          <button onClick={sendMessage} disabled={!input.trim()}
            className="btn-primary px-4 disabled:opacity-50">Send</button>
        </div>
      </div>

      {/* Discussion Forum */}
      <div className="w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-800">Discussion Forum</h3>
            <button onClick={() => setShowNewTopic(!showNewTopic)}
              className="text-xs text-primary font-medium hover:underline">+ New</button>
          </div>

          {showNewTopic && (
            <div className="p-3 border-b border-gray-100 space-y-2">
              <input className="input-field text-sm" placeholder="Topic title"
                value={newTopic} onChange={e => setNewTopic(e.target.value)} />
              <textarea className="input-field text-sm resize-none" rows={2} placeholder="Description"
                value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} />
              <button onClick={createDiscussion} className="btn-primary w-full text-sm py-1.5">Post</button>
            </div>
          )}

          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {discussions.map((d) => (
              <div key={d._id} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{d.title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {d.author?.name} · {d.replies?.length || 0} replies
                </p>
              </div>
            ))}
            {discussions.length === 0 && (
              <p className="text-center text-gray-400 text-xs py-6">No discussions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
