'use client';
import { useEffect, useState } from 'react';
import { adminStats, adminAnalytics, AdminStats, Analytics } from '@/services/admin.api';
import StatCard from './StatCard';

function MiniChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  if (!data.length) return <div style={{ color:'#374151', fontSize:13, textAlign:'center', padding:'24px 0' }}>No data yet</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:64 }}>
      {data.slice(-30).map((d, i) => (
        <div key={i} title={`${d.date}: ${d.count}`} style={{
          flex:1, minWidth:4, borderRadius:4,
          height:`${Math.max((d.count / max) * 100, 4)}%`,
          background: color, opacity:0.7, transition:'height 0.3s', cursor:'default'
        }}/>
      ))}
    </div>
  );
}

export default function OverviewTab() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminStats.get(), adminAnalytics.get()])
      .then(([s, a]) => { setStats(s); setAnalytics(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color:'#6366f1', textAlign:'center', paddingTop:80, fontSize:15 }}>Loading analytics...</div>;

  const cards = [
    { icon:'🏥', label:'Total Clinics',       value: stats?.total_clinics ?? 0,       accent:'#6366f1' },
    { icon:'✅', label:'Active Clinics',       value: stats?.active_clinics ?? 0,      accent:'#10b981' },
    { icon:'👨‍⚕️', label:'Total Doctors',      value: stats?.total_doctors ?? 0,       accent:'#3b82f6' },
    { icon:'👩‍💼', label:'Receptionists',      value: stats?.total_receptionists ?? 0, accent:'#f59e0b' },
    { icon:'🧑‍🤝‍🧑', label:'Total Patients',   value: stats?.total_patients ?? 0,      accent:'#ec4899' },
    { icon:'📋', label:"Today's Tokens",       value: stats?.today_tokens ?? 0,        accent:'#8b5cf6' },
  ];

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ color:'#f9fafb', fontSize:24, fontWeight:800, margin:0 }}>Overview</h1>
        <p style={{ color:'#6b7280', fontSize:14, marginTop:4 }}>System-wide metrics · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
      </div>

      {/* KPI Grid — responsive */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:32 }}>
        {cards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
        {[
          { title:'New Clinics', sub:'Last 30 days', data: analytics?.clinics_per_day ?? [], color:'#818cf8' },
          { title:'Patient Registrations', sub:'Last 30 days', data: analytics?.patients_per_day ?? [], color:'#34d399' },
        ].map(ch => (
          <div key={ch.title} style={{ background:'#1F2937', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, padding:24 }}>
            <div style={{ marginBottom:16 }}>
              <div style={{ color:'#f9fafb', fontWeight:700, fontSize:15 }}>{ch.title}</div>
              <div style={{ color:'#4b5563', fontSize:12, marginTop:2 }}>{ch.sub}</div>
            </div>
            <MiniChart data={ch.data} color={ch.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
