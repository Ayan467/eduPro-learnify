import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c3a 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 text-white">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
            </div>
            <span className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Learnify</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Learn Without<br /><span style={{ color: '#1D9E75' }}>Limits</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Access world-class courses, earn certificates,<br />and accelerate your career.
          </p>
        </div>
        <div className="flex gap-8 mt-8">
          {[['500+', 'Courses'], ['50K+', 'Students'], ['100%', 'Online']].map(([val, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold" style={{ color: '#1D9E75' }}>{val}</p>
              <p className="text-gray-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)' }}>E</div>
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>Welcome back!</h2>
              <p className="text-gray-400 text-sm">Sign in to continue your learning journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all text-sm"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                  onFocus={e => e.target.style.borderColor = '#1D9E75'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all text-sm pr-12"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    onFocus={e => e.target.style.borderColor = '#1D9E75'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white mt-2 flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #1D9E75, #185FA5)', boxShadow: '0 4px 20px rgba(29,158,117,0.4)' }}>
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Sign In
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Demo Accounts</p>
              {[
                ['👨‍🎓 Student', 'student@edupro.com', 'student123'],
                ['👨‍💼 Admin', 'admin@edupro.com', 'admin123'],
                ['👨‍🏫 Instructor', 'priya@edupro.com', 'instructor123'],
              ].map(([role, email, pass]) => (
                <button key={role} onClick={() => { setEmail(email); setPassword(pass); }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between">
                  <span>{role}</span>
                  <span className="text-gray-600">{email}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold" style={{ color: '#1D9E75' }}>Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
