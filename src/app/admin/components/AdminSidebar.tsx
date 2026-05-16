'use client';
import { useRouter } from 'next/navigation';
import { AdminTab } from './types';

const NAV: { id: AdminTab; icon: string; label: string }[] = [
  { id: 'overview', icon: '📊', label: 'Overview'  },
  { id: 'clinics',  icon: '🏥', label: 'Clinics'   },
  { id: 'users',    icon: '👥', label: 'Users'     },
  { id: 'payments', icon: '💳', label: 'Payments'  },
  { id: 'blog',     icon: '✍️', label: 'Blog CMS'  },
  { id: 'team',     icon: '🛡️', label: 'Team'      },
  { id: 'security', icon: '🔒', label: 'Security'  },
];

interface Props { active: AdminTab; onTab: (t: AdminTab) => void; }

export default function AdminSidebar({ active, onTab }: Props) {
  const router = useRouter();
  return (
    <aside style={{ width:220, minHeight:'100vh', background:'#111827', borderRight:'1px solid rgba(99,102,241,0.15)', display:'flex', flexDirection:'column', padding:'24px 12px', flexShrink:0 }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, paddingLeft:6, marginBottom:32 }}>
        <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>⚡</div>
        <div>
          <div style={{ color:'#f1f5f9',fontWeight:800,fontSize:13 }}>ClinicSathi</div>
          <div style={{ color:'#4b5563',fontSize:10,fontWeight:700,letterSpacing:1 }}>ADMIN PANEL</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => onTab(n.id)} style={{
            display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12,
            border: active===n.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            background: active===n.id ? 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12))' : 'transparent',
            color: active===n.id ? '#c4b5fd' : '#64748b', fontWeight:600, fontSize:13, cursor:'pointer', width:'100%', textAlign:'left', transition:'all 0.15s'
          }}>
            <span style={{ fontSize:15 }}>{n.icon}</span>
            <span>{n.label}</span>
            {active===n.id && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#818cf8' }}/>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button onClick={() => { localStorage.removeItem('admin_token'); router.push('/admin/login'); }} style={{
        display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:12,
        border:'none', background:'transparent', color:'#475569', fontWeight:600, fontSize:13,
        cursor:'pointer', width:'100%', marginTop:8, transition:'color 0.15s'
      }}
        onMouseEnter={e=>(e.currentTarget.style.color='#f87171')}
        onMouseLeave={e=>(e.currentTarget.style.color='#475569')}
      >
        <span>🚪</span><span>Logout</span>
      </button>
    </aside>
  );
}
