'use client';
import { useState } from 'react';

export default function SecurityTab() {
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '') + '/api/v1/admin/auth/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('admin_token') || '',
        },
        body: JSON.stringify({ new_user_id: newUserId || undefined, new_password: newPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update security');
      setMsg('✅ ' + data.message);
      setNewUserId('');
      setNewPassword('');
    } catch (err: any) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Security Settings</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Update your admin panel login credentials.</p>

      {msg && (
        <div style={{ padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13, background: msg.includes('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: msg.includes('✅') ? '#34d399' : '#f87171' }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleUpdate} style={{ background: '#1F2937', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Change User ID (Optional)</label>
          <input
            type="text"
            value={newUserId}
            onChange={e => setNewUserId(e.target.value)}
            placeholder="Enter new user ID"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(99,102,241,0.2)', color: 'white', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>Change Password (Optional)</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, background: '#0F172A', border: '1px solid rgba(99,102,241,0.2)', color: 'white', outline: 'none' }}
          />
        </div>

        <button disabled={loading || (!newUserId && !newPassword)} type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', opacity: loading || (!newUserId && !newPassword) ? 0.5 : 1 }}>
          {loading ? 'Saving...' : '💾 Save Security Settings'}
        </button>
      </form>
    </div>
  );
}
