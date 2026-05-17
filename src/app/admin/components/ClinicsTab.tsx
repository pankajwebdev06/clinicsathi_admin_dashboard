'use client';
import { useEffect, useState } from 'react';
import { adminClinics, AdminClinic } from '@/services/admin.api';

function Badge({ active }: { active: boolean }) {
  return (
    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
      background: active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
      color: active ? '#34d399' : '#f87171', border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}` }}>
      {active ? '● Active' : '● Inactive'}
    </span>
  );
}

const TH: React.CSSProperties = { color:'#6b7280', fontSize:11, fontWeight:700, textAlign:'left', padding:'12px 16px', letterSpacing:0.8, borderBottom:'1px solid rgba(255,255,255,0.05)', textTransform:'uppercase' };
const TD: React.CSSProperties = { color:'#d1d5db', fontSize:13, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', verticalAlign:'middle' };

export default function ClinicsTab() {
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = (q?: string) => {
    setLoading(true);
    adminClinics.list(q).then(setClinics).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id: string) => {
    setToggling(id);
    try { const r = await adminClinics.toggle(id); setClinics(prev => prev.map(c => c.id === id ? { ...c, is_active: r.is_active } : c)); }
    catch (e: any) { alert(e.message); }
    finally { setToggling(null); }
  };

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.city||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <style>{`
        .clinics-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
        .clinics-search { background: #1F2937; border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; color: #f1f5f9; padding: 12px 16px; font-size: 14px; outline: none; width: 220px; min-height: 44px; }
        .clinics-table-wrap { background: #1F2937; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }
        .clinics-mobile { display: none; }
        @media (max-width: 767px) {
          .clinics-search { width: 100%; }
          .clinics-table-wrap { display: none; }
          .clinics-mobile { display: flex; flex-direction: column; gap: 10px; }
        }
      `}</style>
      <div className="clinics-header">
        <div>
          <h1 style={{ color: '#f9fafb', fontSize: 24, fontWeight: 800, margin: 0 }}>Clinics</h1>
          <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{clinics.length} registered clinics</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search clinics…" className="clinics-search" />
      </div>

      {/* Desktop / tablet: table */}
      <div className="clinics-table-wrap">
        {loading ? (
          <div style={{ color: '#6366f1', textAlign: 'center', padding: 40 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#374151', textAlign: 'center', padding: 40 }}>No clinics found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Clinic', 'Doctor', 'City', 'Patients', 'Staff', 'Joined', 'Status', ''].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={TD}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{c.name}</div>
                    {c.specialization && <div style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>{c.specialization}</div>}
                  </td>
                  <td style={TD}>{c.doctor_name}</td>
                  <td style={TD}>{c.city || '—'}</td>
                  <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: '#818cf8' }}>{c.patient_count}</td>
                  <td style={{ ...TD, textAlign: 'center', color: '#9ca3af' }}>{c.staff_count}</td>
                  <td style={{ ...TD, color: '#6b7280', fontSize: 12 }}>{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}</td>
                  <td style={TD}><Badge active={c.is_active} /></td>
                  <td style={TD}>
                    <button onClick={() => toggle(c.id)} disabled={toggling === c.id} style={{
                      padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)',
                      background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', opacity: toggling === c.id ? 0.5 : 1, minHeight: 36,
                    }}>
                      {toggling === c.id ? '…' : c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile: stacked cards */}
      <div className="clinics-mobile">
        {loading ? (
          <div style={{ color: '#6366f1', textAlign: 'center', padding: 40 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: '#374151', textAlign: 'center', padding: 40 }}>No clinics found</div>
        ) : (
          filtered.map(c => (
            <div key={c.id} style={{
              background: '#1F2937', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{c.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{c.doctor_name}</div>
                  {c.specialization && <div style={{ color: '#4b5563', fontSize: 11, marginTop: 2 }}>{c.specialization}</div>}
                </div>
                <Badge active={c.is_active} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10, fontSize: 11 }}>
                <div>
                  <div style={{ color: '#4b5563', textTransform: 'uppercase', fontWeight: 700, fontSize: 9, letterSpacing: 0.5 }}>City</div>
                  <div style={{ color: '#d1d5db', fontWeight: 600, marginTop: 2 }}>{c.city || '—'}</div>
                </div>
                <div>
                  <div style={{ color: '#4b5563', textTransform: 'uppercase', fontWeight: 700, fontSize: 9, letterSpacing: 0.5 }}>Patients</div>
                  <div style={{ color: '#818cf8', fontWeight: 700, marginTop: 2 }}>{c.patient_count}</div>
                </div>
                <div>
                  <div style={{ color: '#4b5563', textTransform: 'uppercase', fontWeight: 700, fontSize: 9, letterSpacing: 0.5 }}>Staff</div>
                  <div style={{ color: '#d1d5db', fontWeight: 600, marginTop: 2 }}>{c.staff_count}</div>
                </div>
              </div>
              <button onClick={() => toggle(c.id)} disabled={toggling === c.id} style={{
                width: '100%', padding: '10px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)',
                background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', opacity: toggling === c.id ? 0.5 : 1, minHeight: 44,
              }}>
                {toggling === c.id ? '…' : c.is_active ? 'Deactivate Clinic' : 'Activate Clinic'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
