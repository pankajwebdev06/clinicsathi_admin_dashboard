'use client';
import { useEffect, useState } from 'react';
import { adminTeam, TeamMember } from '@/services/admin.api';

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label:'Super Admin', color:'#c4b5fd', bg:'rgba(139,92,246,0.15)' },
  editor:      { label:'Editor',      color:'#93c5fd', bg:'rgba(59,130,246,0.15)'  },
  support:     { label:'Support',     color:'#fcd34d', bg:'rgba(245,158,11,0.15)'  },
};

export default function TeamTab() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const load = () => adminTeam.list().then(setMembers).catch(console.error).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setOk(''); setAdding(true);
    try {
      await adminTeam.add({ name, email, role });
      setName(''); setEmail(''); setRole('editor');
      setOk('✅ Team member added!');
      await load();
    } catch (ex: any) { setErr(ex.message); }
    finally { setAdding(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    setRemoving(id);
    try { await adminTeam.remove(id); await load(); }
    catch (ex: any) { setErr(ex.message); }
    finally { setRemoving(null); }
  };

  const input: React.CSSProperties = {
    background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.2)',
    borderRadius:12, color:'#f1f5f9', padding:'10px 14px', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box'
  };

  return (
    <div style={{ maxWidth:900 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'#f9fafb', fontSize:24, fontWeight:800, margin:0 }}>Team</h1>
        <p style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>Manage internal ClinicSathi team members</p>
      </div>

      {/* Add Form */}
      <div style={{ background:'#1F2937', border:'1px solid rgba(99,102,241,0.15)', borderRadius:20, padding:24, marginBottom:24 }}>
        <h2 style={{ color:'#c4b5fd', fontWeight:700, fontSize:15, margin:'0 0 16px' }}>➕ Add Team Member</h2>
        <form onSubmit={add} style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto auto', gap:12, alignItems:'end' }}>
          <div>
            <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Full Name</label>
            <input style={input} required value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" />
          </div>
          <div>
            <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Email</label>
            <input style={input} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@clinicsathi.in" />
          </div>
          <div>
            <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ ...input, width:'auto', paddingRight:28, cursor:'pointer' }}>
              <option value="super_admin">Super Admin</option>
              <option value="editor">Editor</option>
              <option value="support">Support</option>
            </select>
          </div>
          <button type="submit" disabled={adding} style={{
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none',
            borderRadius:12, padding:'10px 20px', fontSize:13, fontWeight:700, cursor:'pointer',
            opacity: adding ? 0.6 : 1, whiteSpace:'nowrap'
          }}>{adding ? '…' : 'Add Member'}</button>
        </form>
        {err && <p style={{ color:'#f87171', fontSize:12, marginTop:10 }}>{err}</p>}
        {ok  && <p style={{ color:'#34d399', fontSize:12, marginTop:10 }}>{ok}</p>}
      </div>

      {/* Members List */}
      <div style={{ background:'#1F2937', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'hidden' }}>
        {loading ? (
          <div style={{ color:'#6366f1', textAlign:'center', padding:40 }}>Loading…</div>
        ) : members.length === 0 ? (
          <div style={{ color:'#374151', textAlign:'center', padding:40 }}>No team members yet.</div>
        ) : members.map(m => {
          const rs = ROLE_LABEL[m.role] || { label:m.role, color:'#a5b4fc', bg:'rgba(99,102,241,0.1)' };
          return (
            <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:'rgba(99,102,241,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'#818cf8', fontSize:16 }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:14 }}>{m.name}</div>
                  <div style={{ color:'#6b7280', fontSize:12, marginTop:2 }}>{m.email}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ padding:'4px 12px', borderRadius:20, fontSize:11, fontWeight:700, background:rs.bg, color:rs.color }}>{rs.label}</span>
                <span style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20,
                  background: m.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                  color: m.is_active ? '#34d399' : '#f87171' }}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => remove(m.id)} disabled={removing===m.id} style={{
                  background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171',
                  borderRadius:10, padding:'6px 14px', fontSize:12, fontWeight:600, cursor:'pointer', opacity: removing===m.id ? 0.5 : 1
                }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
