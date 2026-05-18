'use client';
import { useEffect, useState } from 'react';
import { adminUsers, AdminUser } from '@/services/admin.api';

const TH: React.CSSProperties = { color:'#6b7280', fontSize:11, fontWeight:700, textAlign:'left', padding:'12px 16px', letterSpacing:0.8, borderBottom:'1px solid rgba(255,255,255,0.05)', textTransform:'uppercase' };
const TD: React.CSSProperties = { color:'#d1d5db', fontSize:13, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', verticalAlign:'middle' };

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  doctor:        { bg:'rgba(59,130,246,0.15)',  color:'#93c5fd' },
  receptionist:  { bg:'rgba(245,158,11,0.15)',  color:'#fcd34d' },
};

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminUsers.list(role || undefined, search || undefined)
      .then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, [role, search]);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:12 }}>
          <div>
            <h1 style={{ color:'#f9fafb', fontSize:24, fontWeight:800, margin:0 }}>Users</h1>
            <p style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>{users.length} users across all clinics</p>
          </div>
        </div>
        {/* Filters — wrap on mobile */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
          {['','doctor','receptionist'].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding:'8px 14px', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              border: role===r ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
              background: role===r ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
              color: role===r ? '#c4b5fd' : '#6b7280', whiteSpace:'nowrap'
            }}>{r === '' ? 'All' : r.charAt(0).toUpperCase()+r.slice(1)+'s'}</button>
          ))}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search…"
            style={{ background:'#1F2937', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, color:'#f1f5f9', padding:'8px 14px', fontSize:13, outline:'none', minWidth:0, flex:'1 1 140px', maxWidth:220 }} />
        </div>
      </div>

      <div style={{ background:'#1F2937', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'auto' }}>
        {loading ? (
          <div style={{ color:'#6366f1', textAlign:'center', padding:40 }}>Loading…</div>
        ) : (
          <table style={{ width:'100%', minWidth:560, borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Name','Mobile','Role','Clinic','Joined','Status'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => {
                const rs = ROLE_STYLE[u.role] || { bg:'rgba(99,102,241,0.1)', color:'#a5b4fc' };
                return (
                  <tr key={u.id}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.04)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={TD}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#818cf8', fontSize:13 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight:600, color:'#f1f5f9' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ ...TD, fontFamily:'monospace', color:'#9ca3af' }}>+91 {u.mobile_number}</td>
                    <td style={TD}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:rs.bg, color:rs.color }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={TD}>{u.clinic_name}</td>
                    <td style={{ ...TD, color:'#6b7280', fontSize:12 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={TD}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                        background: u.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                        color: u.is_active ? '#34d399' : '#f87171' }}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
