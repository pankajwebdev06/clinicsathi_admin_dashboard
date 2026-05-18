'use client';
import { useEffect, useState } from 'react';
import { adminPayments, PaymentRecord } from '@/services/admin.api';
import StatCard from './StatCard';

const TH: React.CSSProperties = { color:'#6b7280', fontSize:11, fontWeight:700, textAlign:'left', padding:'12px 16px', letterSpacing:0.8, borderBottom:'1px solid rgba(255,255,255,0.05)', textTransform:'uppercase' };
const TD: React.CSSProperties = { color:'#d1d5db', fontSize:13, padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', verticalAlign:'middle' };

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  paid:    { bg:'rgba(16,185,129,0.15)',  color:'#34d399' },
  pending: { bg:'rgba(245,158,11,0.15)',  color:'#fcd34d' },
  failed:  { bg:'rgba(239,68,68,0.12)',   color:'#f87171' },
  trial:   { bg:'rgba(99,102,241,0.15)',  color:'#a5b4fc' },
};

export default function PaymentsTab() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminPayments.list().then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalRevenue = records.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount || 0), 0);
  const pending = records.filter(r => r.status === 'pending').length;
  const failed  = records.filter(r => r.status === 'failed').length;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:'#f9fafb', fontSize:24, fontWeight:800, margin:0 }}>Payments</h1>
        <p style={{ color:'#6b7280', fontSize:13, marginTop:4 }}>Subscription & billing records from all clinics</p>
      </div>

      {/* Summary Cards — 1 col mobile, 3 col sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        <StatCard icon="💰" label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} accent="#10b981" />
        <StatCard icon="⏳" label="Pending Payments" value={pending} accent="#f59e0b" />
        <StatCard icon="❌" label="Failed Payments" value={failed} accent="#ef4444" />
      </div>

      {/* Table */}
      <div style={{ background:'#1F2937', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, overflow:'auto' }}>
        {loading ? (
          <div style={{ color:'#6366f1', textAlign:'center', padding:40 }}>Loading…</div>
        ) : records.length === 0 ? (
          <div style={{ color:'#374151', textAlign:'center', padding:40 }}>No payment records yet</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>{['Clinic','Plan','Amount','Status','Method','Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map(r => {
                const ss = STATUS_STYLE[r.status] || { bg:'rgba(99,102,241,0.1)', color:'#a5b4fc' };
                return (
                  <tr key={r.id}
                    onMouseEnter={e=>(e.currentTarget.style.background='rgba(99,102,241,0.04)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <td style={{ ...TD, fontWeight:600, color:'#f1f5f9' }}>{r.clinic_name}</td>
                    <td style={TD}>{r.plan}</td>
                    <td style={{ ...TD, fontWeight:700, color:'#a5b4fc' }}>
                      {r.amount > 0 ? `₹${r.amount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={TD}>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:ss.bg, color:ss.color }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ ...TD, color:'#6b7280' }}>{r.payment_method || '—'}</td>
                    <td style={{ ...TD, color:'#6b7280', fontSize:12 }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}
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
