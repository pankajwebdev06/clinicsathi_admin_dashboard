'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTab } from './components/types';
import AdminSidebar from './components/AdminSidebar';
import OverviewTab  from './components/OverviewTab';
import ClinicsTab   from './components/ClinicsTab';
import UsersTab     from './components/UsersTab';
import PaymentsTab    from './components/PaymentsTab';
import PromoCodesTab  from './components/PromoCodesTab';
import BlogTab        from './components/BlogTab';
import TeamTab      from './components/TeamTab';
import SecurityTab  from './components/SecurityTab';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/admin/login'); return; }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div style={{ minHeight:'100vh', background:'#0A0F1E', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:40, height:40, border:'3px solid #6366f1', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
          <div style={{ color:'#6366f1', fontWeight:600 }}>Loading admin panel…</div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  const CONTENT: Record<AdminTab, React.ReactNode> = {
    overview: <OverviewTab />,
    clinics:  <ClinicsTab />,
    users:    <UsersTab />,
    payments:    <PaymentsTab />,
    promo_codes: <PromoCodesTab />,
    blog:        <BlogTab />,
    team:     <TeamTab />,
    security: <SecurityTab />,
  };

  return (
    <div className="admin-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:#334155}

        .admin-shell {
          display: flex;
          min-height: 100vh;
          background: #0A0F1E;
          font-family: Inter, system-ui, sans-serif;
        }
        .admin-main {
          flex: 1;
          overflow-y: auto;
          padding: 32px 36px;
          max-height: 100vh;
          min-width: 0;
        }
        @media (max-width: 767px) {
          .admin-shell { flex-direction: column; }
          .admin-main {
            padding: 16px 14px 96px;   /* extra bottom padding for fixed bottom-nav */
            max-height: none;
          }
        }
      `}</style>

      <AdminSidebar active={tab} onTab={setTab} />

      <main className="admin-main">
        {CONTENT[tab]}
      </main>
    </div>
  );
}
