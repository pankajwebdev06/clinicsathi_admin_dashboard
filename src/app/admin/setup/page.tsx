'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuth } from '@/services/admin.api';

export default function AdminSetupPage() {
  const router = useRouter();
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const setupToken = localStorage.getItem('admin_setup_token');
    if (!setupToken) {
      router.replace('/admin/login');
      return;
    }
    setToken(setupToken);
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newUserId.trim().length < 4) {
      setError('User ID must be at least 4 characters');
      return;
    }
    if (newUserId.trim().toLowerCase() === 'admin') {
      setError('You cannot use the default "admin" User ID. Pick something secure.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await adminAuth.setup(token, newUserId.trim(), newPassword);
      localStorage.removeItem('admin_setup_token');
      router.push('/admin/login');
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0F1E' }}>
      <style>{`
        .glass-card {
          background: rgba(17, 24, 39, 0.85);
          border: 1px solid rgba(16, 185, 129, 0.2);
          backdrop-filter: blur(16px);
        }
        .input-dark {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #F1F5F9;
          transition: all 0.2s;
        }
        .input-dark:focus {
          outline: none;
          border-color: rgba(16, 185, 129, 0.7);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .btn-success {
          background: linear-gradient(135deg, #10b981, #059669);
          transition: all 0.2s;
        }
        .btn-success:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(16,185,129,0.25); }
      `}</style>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-white tracking-tight">Secure Your Account</h1>
          <p className="text-emerald-400 text-sm mt-1 font-medium">Please change your default credentials.</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700/40 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">New User ID</label>
              <input
                type="text"
                value={newUserId}
                onChange={e => setNewUserId(e.target.value)}
                required
                placeholder="e.g. john_admin"
                className="input-dark w-full px-4 py-3.5 rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className="input-dark w-full px-4 py-3.5 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Type password again"
                className="input-dark w-full px-4 py-3.5 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !newUserId || !newPassword || !confirmPassword}
              className="btn-success w-full py-3.5 rounded-xl font-bold text-white text-sm mt-4 disabled:opacity-50"
            >
              {loading ? 'Saving...' : '💾 Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
