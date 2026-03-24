import { useState, useRef, useEffect } from 'react';

const getHour = () => new Date().getHours();
const getGreeting = () => {
  const h = getHour();
  if (h < 12) return 'Good morning! ☀️';
  if (h < 17) return 'Good afternoon! 👋';
  return 'Good evening! 🌙';
};

const COURSES_DATA = [
  { name: 'React Mastery', category: 'Frontend', level: 'Intermediate', keywords: ['react','frontend','javascript','js','web','ui'] },
  { name: 'Node.js Mastery', category: 'Backend', level: 'Intermediate', keywords: ['node','backend','server','api','express'] },
  { name: 'Python for ML', category: 'AI/ML', level: 'Advanced', keywords: ['python','ml','ai','machine learning','data'] },
  { name: 'HTML & CSS for Beginners', category: 'Frontend', level: 'Beginner', keywords: ['html','css','web','beginner','start','basics','free'] },
  { name: 'Git & GitHub', category: 'DevOps', level: 'Beginner', keywords: ['git','github','version control','free'] },
  { name: 'JavaScript Fundamentals', category: 'Frontend', level: 'Beginner', keywords: ['javascript','js','beginner','free','basics'] },
];

const suggestCourses = (input) => {
  const lower = input.toLowerCase();
  return COURSES_DATA.filter(c => c.keywords.some(k => lower.includes(k))).slice(0, 2);
};

const getBotReply = (input) => {
  const lower = input.toLowerCase().trim();

  if (/^(hi|hello|hey|hii|namaste|howdy)/.test(lower))
    return { text: `${getGreeting()} I'm **Alexa** 🤖, your personal learning assistant!\n\nHow can I help you today?\n\n• Course suggestions\n• How to enroll\n• About certificates\n• Platform help` };

  if (/how are you|kaisa|how r you/.test(lower))
    return { text: "I'm doing great, thanks for asking! 😊 Ready to help you learn something amazing today. What would you like to explore?" };

  if (/good (morning|afternoon|evening|night)|gm /.test(lower))
    return { text: `${getGreeting()} Hope you're having a wonderful day! Ready to continue your learning journey? 📚` };

  if (/thank|thanks/.test(lower))
    return { text: "You're most welcome! 😊 Is there anything else I can help you with?" };

  if (/suggest|recommend|which course|best course|start|begin|new to/.test(lower)) {
    const courses = suggestCourses(lower);
    if (courses.length > 0)
      return { text: `Great question! Based on your interest:\n\n${courses.map(c => `📚 **${c.name}** — ${c.category} · ${c.level}`).join('\n')}\n\nFind these in the Courses section! 🎯` };
    return { text: "Here are some popular courses:\n\n📚 **HTML & CSS** — Beginner · Free!\n📚 **JavaScript Fundamentals** — Beginner · Free!\n📚 **React Mastery** — Intermediate\n\nVisit Courses page to see all! 🎯" };
  }

  if (/beginner|fresher|new|no experience|first|basics/.test(lower))
    return { text: "Welcome! 🌟 Perfect starting point for you:\n\n1️⃣ **HTML & CSS** — Free!\n2️⃣ **JavaScript Fundamentals** — Free!\n3️⃣ **Git & GitHub** — Free!\n\nAll 3 are free — start today! 💪" };

  if (/ai|ml|machine learning|data science/.test(lower))
    return { text: "Interested in AI/ML? Great choice! 🤖\n\n📚 **Python for Machine Learning** is our top-rated course!\n\nYou'll learn NumPy, Pandas, Scikit-learn and more." };

  if (/enroll|join|how to/.test(lower))
    return { text: "Enrolling is easy! 🎉\n\n1. Go to **Courses** page\n2. Click any course\n3. Click **Enroll** button\n4. Free courses — instant access!\n5. Paid courses — complete payment\n\nDone! Start learning! 🚀" };

  if (/certificate|certif/.test(lower))
    return { text: "Certificates are auto-generated! 🏆\n\n✅ Complete all lectures\n✅ Mark each lecture done\n✅ Reach 100% progress\n✅ Certificate auto-generated!\n✅ Download PDF from Certificates page" };

  if (/pay|payment|price|cost|free/.test(lower))
    return { text: "Pricing:\n\n🆓 **Free courses** — HTML, CSS, Git, JavaScript\n💳 **Paid courses** — React, Node.js, Python ML\n\nAll courses include certificate on completion! 🏆" };

  if (/progress|track|complete/.test(lower))
    return { text: "Track progress easily! 📊\n\n• Dashboard shows overall progress\n• Learn page shows lecture progress\n• Mark lectures complete as you go\n• 100% = Certificate unlocked! 🏆" };

  if (/chat|instructor|doubt|help/.test(lower))
    return { text: "Need help from instructor? 💬\n\n1. Open any enrolled course\n2. Click **Chat** button\n3. Ask your question!\n\nAlso try the **Discussion Forum** on each course page." };

  const defaults = [
    "I'm here to help! 😊 Try asking:\n• 'Suggest a course'\n• 'How do I enroll?'\n• 'About certificates'",
    "Great question! Ask me about courses, enrollment, certificates, or progress tracking! 🎯",
    "Not sure about that, but I can help with:\n• Course recommendations\n• How to get certificates\n• Platform navigation 😊",
  ];
  return { text: defaults[Math.floor(Math.random() * defaults.length)] };
};

const QUICK_REPLIES = ['Suggest a course 📚', 'How to enroll?', 'Free courses 🆓', "I'm a beginner", 'About certificates 🏆'];

export default function HelpBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{
    from: 'bot',
    text: `${getGreeting()} I'm **Alexa** 🤖 — your personal learning assistant!\n\nHow can I help you today?`,
    time: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg, time: new Date() }]);
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(msg);
      setMessages(prev => [...prev, { from: 'bot', text: reply.text, time: new Date() }]);
      setTyping(false);
      if (!open) setUnread(c => c + 1);
    }, 600 + Math.random() * 400);
  };

  const formatText = (text) =>
    text.split('\n').map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} className={line === '' ? 'h-1' : 'leading-relaxed'} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ height: '500px', background: '#fff', border: '1px solid #e5e7eb' }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}
            className="px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 64 64" fill="white" xmlns="http://www.w3.org/2000/svg">
                <rect x="16" y="18" width="32" height="26" rx="6" fill="white" opacity="0.95"/>
                <circle cx="24" cy="28" r="4" fill="#1D9E75"/><circle cx="40" cy="28" r="4" fill="#1D9E75"/>
                <circle cx="25.5" cy="26.5" r="1.5" fill="white"/><circle cx="41.5" cy="26.5" r="1.5" fill="white"/>
                <rect x="23" y="36" width="18" height="3" rx="1.5" fill="#185FA5"/>
                <rect x="25" y="36" width="3" height="3" rx="0.5" fill="white"/>
                <rect x="30" y="36" width="3" height="3" rx="0.5" fill="white"/>
                <rect x="35" y="36" width="3" height="3" rx="0.5" fill="white"/>
                <rect x="30" y="10" width="4" height="8" rx="2" fill="white" opacity="0.9"/>
                <circle cx="32" cy="9" r="3" fill="white" opacity="0.9"/>
                <rect x="10" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
                <rect x="48" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Alexa</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                <p className="text-white/70 text-xs">Learning Assistant · Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg">✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: '#f8fafc' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.from === 'bot' && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1"
                    style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
                    <svg width="16" height="16" viewBox="0 0 64 64" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <rect x="16" y="18" width="32" height="26" rx="6" fill="white" opacity="0.95"/>
                      <circle cx="24" cy="28" r="4" fill="#1D9E75"/><circle cx="40" cy="28" r="4" fill="#1D9E75"/>
                      <circle cx="25.5" cy="26.5" r="1.5" fill="white"/><circle cx="41.5" cy="26.5" r="1.5" fill="white"/>
                      <rect x="23" y="36" width="18" height="3" rx="1.5" fill="#185FA5"/>
                      <rect x="30" y="10" width="4" height="8" rx="2" fill="white" opacity="0.9"/>
                      <circle cx="32" cy="9" r="3" fill="white" opacity="0.9"/>
                      <rect x="10" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
                      <rect x="48" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
                    </svg>
                  </div>
                )}
                <div className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-xs leading-relaxed space-y-0.5 ${
                  m.from === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-white text-gray-700 rounded-bl-sm shadow-sm border border-gray-100'
                }`}
                  style={m.from === 'user' ? { background: 'linear-gradient(135deg, #1D9E75, #185FA5)' } : {}}>
                  {formatText(m.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
                  <svg width="16" height="16" viewBox="0 0 64 64" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <rect x="16" y="18" width="32" height="26" rx="6" fill="white" opacity="0.95"/>
                    <circle cx="24" cy="28" r="4" fill="#1D9E75"/><circle cx="40" cy="28" r="4" fill="#1D9E75"/>
                    <circle cx="25.5" cy="26.5" r="1.5" fill="white"/><circle cx="41.5" cy="26.5" r="1.5" fill="white"/>
                    <rect x="23" y="36" width="18" height="3" rx="1.5" fill="#185FA5"/>
                    <rect x="30" y="10" width="4" height="8" rx="2" fill="white" opacity="0.9"/>
                    <circle cx="32" cy="9" r="3" fill="white" opacity="0.9"/>
                    <rect x="10" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
                    <rect x="48" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
                  </svg>
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100">
                  <div className="flex gap-1 items-center h-3">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 border-t border-gray-100 bg-white">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 font-medium transition-all hover:text-white"
                  style={{ background: '#E1F5EE', color: '#0F6E56' }}
                  onMouseEnter={e => { e.target.style.background = '#1D9E75'; e.target.style.color = '#fff'; }}
                  onMouseLeave={e => { e.target.style.background = '#E1F5EE'; e.target.style.color = '#0F6E56'; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyPress={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Ask Alexa anything..."
              className="flex-1 text-xs border border-gray-200 rounded-full px-4 py-2 focus:outline-none bg-gray-50"
              style={{ focusBorderColor: '#1D9E75' }} />
            <button onClick={() => sendMessage()} disabled={!input.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-40 shrink-0 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button onClick={() => { setOpen(!open); setUnread(0); }}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white font-bold text-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 64 64" fill="white" xmlns="http://www.w3.org/2000/svg">
            {/* Head */}
            <rect x="16" y="18" width="32" height="26" rx="6" fill="white" opacity="0.95"/>
            {/* Eyes */}
            <circle cx="24" cy="28" r="4" fill="#1D9E75"/>
            <circle cx="40" cy="28" r="4" fill="#1D9E75"/>
            <circle cx="25.5" cy="26.5" r="1.5" fill="white"/>
            <circle cx="41.5" cy="26.5" r="1.5" fill="white"/>
            {/* Mouth */}
            <rect x="23" y="36" width="18" height="3" rx="1.5" fill="#185FA5"/>
            {/* Teeth */}
            <rect x="25" y="36" width="3" height="3" rx="0.5" fill="white"/>
            <rect x="30" y="36" width="3" height="3" rx="0.5" fill="white"/>
            <rect x="35" y="36" width="3" height="3" rx="0.5" fill="white"/>
            {/* Antenna */}
            <rect x="30" y="10" width="4" height="8" rx="2" fill="white" opacity="0.9"/>
            <circle cx="32" cy="9" r="3" fill="white" opacity="0.9"/>
            {/* Ears */}
            <rect x="10" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
            <rect x="48" y="26" width="6" height="10" rx="3" fill="white" opacity="0.8"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
