'use client';
import { useRouter } from 'next/navigation';
import { AdminTab } from './types';

const NAV: { id: AdminTab; icon: string; label: string; short: string }[] = [
  { id: 'overview', icon: '📊', label: 'Overview',  short: 'Stats'    },
  { id: 'clinics',  icon: '🏥', label: 'Clinics',   short: 'Clinics'  },
  { id: 'users',    icon: '👥', label: 'Users',     short: 'Users'    },
  { id: 'payments', icon: '💳', label: 'Payments',  short: 'Pay'      },
  { id: 'blog',     icon: '✍️', label: 'Blog CMS',  short: 'Blog'     },
  { id: 'team',     icon: '🛡️', label: 'Team',      short: 'Team'     },
  { id: 'security', icon: '🔒', label: 'Security',  short: 'Security' },
];

interface Props { active: AdminTab; onTab: (t: AdminTab) => void; }

export default function AdminSidebar({ active, onTab }: Props) {
  const router = useRouter();
  const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login'); };

  return (
    <>
      {/* ── DESKTOP SIDEBAR (md+) ─────────────────────────────────── */}
      <aside className="admin-sidebar-desktop" style={{
        width: 220, minHeight: '100vh', background: '#111827',
        borderRight: '1px solid rgba(99,102,241,0.15)',
        display: 'flex', flexDirection: 'column', padding: '24px 12px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 13 }}>ClinicSathi</div>
            <div style={{ color: '#4b5563', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>ADMIN PANEL</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => onTab(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px', borderRadius: 12,
              border: active === n.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
              background: active === n.id ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))' : 'transparent',
              color: active === n.id ? '#c4b5fd' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              width: '100%', textAlign: 'left', transition: 'all 0.15s', minHeight: 44,
            }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              <span>{n.label}</span>
              {active === n.id && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#818cf8' }} />}
            </button>
          ))}
        </nav>

        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px', borderRadius: 12,
          border: 'none', background: 'transparent', color: '#475569', fontWeight: 600, fontSize: 13,
          cursor: 'pointer', width: '100%', marginTop: 8, transition: 'color 0.15s', minHeight: 44,
        }}>
          <span>🚪</span><span>Logout</span>
        </button>
      </aside>

      {/* ── MOBILE TOP BAR + BOTTOM NAV ─────────────────────────── */}
      {/* Top bar with logo + tab label */}
      <div className="admin-topbar-mobile" style={{
        position: 'sticky', top: 0, zIndex: 40, background: '#111827',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 13, lineHeight: 1.1 }}>ClinicSathi</div>
            <div style={{ color: '#818cf8', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {NAV.find(n => n.id === active)?.label || 'Admin'}
            </div>
          </div>
        </div>
        <button onClick={logout} style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
          padding: '8px 12px', color: '#f87171', fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 36,
        }}>🚪 Logout</button>
      </div>

      {/* Bottom tab bar — scrollable horizontally for the 7 tabs */}
      <nav className="admin-bottomnav-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#0f1729', borderTop: '1px solid rgba(99,102,241,0.2)',
        display: 'flex', overflowX: 'auto', overflowY: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}>
        {NAV.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => onTab(n.id)} style={{
              flex: '0 0 72px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '10px 4px', gap: 2, background: 'transparent', border: 'none', cursor: 'pointer',
              color: isActive ? '#c4b5fd' : '#475569', position: 'relative', minHeight: 56,
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{n.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700 }}>{n.short}</span>
              {isActive && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: '#818cf8', borderRadius: '0 0 3px 3px' }} />}
            </button>
          );
        })}
      </nav>

      {/* Responsive switching — show desktop sidebar on md+, mobile bars below */}
      <style>{`
        @media (max-width: 767px) {
          .admin-sidebar-desktop { display: none !important; }
        }
        @media (min-width: 768px) {
          .admin-topbar-mobile { display: none !important; }
          .admin-bottomnav-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}
