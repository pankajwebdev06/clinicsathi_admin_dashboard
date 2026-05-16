'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/services/admin.api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await adminAuth.login(adminKey, password);
      if (data.require_setup && data.setup_token) {
        // Redirect to setup page with the setup token
        localStorage.setItem('admin_setup_token', data.setup_token);
        router.push('/admin/setup');
        return;
      }
      localStorage.setItem('admin_token', data.access_token || '');
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const data = await adminAuth.forgot(email);
      setMsg(data.message || 'Instruction sent to email.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to request reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen admin-bg flex items-center justify-center p-4">
      <style>{`
        .admin-bg {
          background: #0A0F1E;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.10) 0%, transparent 60%);
        }
        .glass-card {
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid rgba(99, 102, 241, 0.18);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .input-dark {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #F1F5F9 !important;
          -webkit-text-fill-color: #F1F5F9 !important;
          transition: all 0.2s;
        }
        .input-dark:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.7);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          color: #F1F5F9 !important;
          -webkit-text-fill-color: #F1F5F9 !important;
        }
        .input-dark::placeholder { color: #64748b; opacity: 1; }
        .input-dark:-webkit-autofill,
        .input-dark:-webkit-autofill:hover,
        .input-dark:-webkit-autofill:focus {
          -webkit-text-fill-color: #F1F5F9 !important;
          -webkit-box-shadow: 0 0 0px 1000px rgba(15, 23, 42, 0.8) inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        input[type="password"].input-dark {
          color: #F1F5F9 !important;
          -webkit-text-fill-color: #F1F5F9 !important;
        }
        input[type="text"].input-dark {
          color: #F1F5F9 !important;
          -webkit-text-fill-color: #F1F5F9 !important;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.35); }
        .btn-primary:active { transform: translateY(0); }
        .logo-glow { filter: drop-shadow(0 0 20px rgba(99,102,241,0.5)); }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
          100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
        }
        .pulse { animation: pulse-ring 2s infinite; }
      `}</style>

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 mb-4 logo-glow pulse mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ClinicSathi Admin</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Internal Developer Console</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-lg font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-7">Sign in with your admin credentials.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm flex items-center gap-2">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}
          {msg && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 text-sm flex items-center gap-2">
              <span className="text-base">✅</span>
              {msg}
            </div>
          )}

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Admin Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">User ID</label>
                <div className="relative">
                  <input
                    id="admin-key"
                    type={showKey ? 'text' : 'password'}
                  value={adminKey}
                  onChange={e => setAdminKey(e.target.value)}
                  required
                  placeholder="Enter admin secret key"
                  className="input-dark w-full px-4 py-3.5 rounded-xl pr-12 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                >
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  className="input-dark w-full px-4 py-3.5 rounded-xl pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading || !adminKey || !password}
              className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Authenticating...
                </span>
              ) : (
                '🔐 Sign In to Admin Panel'
              )}
            </button>
            <div className="text-center mt-2">
               <button type="button" onClick={() => { setView('forgot'); setError(''); setMsg(''); }} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Forgot User ID / Password?</button>
            </div>
          </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Registered Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@clinicsathi.com"
                  className="input-dark w-full px-4 py-3.5 rounded-xl text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-white text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Recovery Instruction'}
              </button>
              <div className="text-center mt-2">
                 <button type="button" onClick={() => { setView('login'); setError(''); setMsg(''); }} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">← Back to Login</button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-600 text-center">
              This panel is for authorized ClinicSathi team members only.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          ClinicSathi © 2026 · Internal Use Only
        </p>
      </div>
    </div>
  );
}
