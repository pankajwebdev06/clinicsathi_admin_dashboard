'use client';

interface Props {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string; // hex color
}

export default function StatCard({ icon, label, value, sub, accent = '#6366f1' }: Props) {
  return (
    <div style={{
      background:'#1F2937', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20,
      padding:'22px 24px', display:'flex', flexDirection:'column', gap:12, position:'relative', overflow:'hidden'
    }}>
      {/* Glow blob */}
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:accent, opacity:0.08, filter:'blur(20px)', pointerEvents:'none' }}/>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ color:'#9ca3af', fontSize:13, fontWeight:600, letterSpacing:0.3 }}>{label}</span>
        <div style={{ width:38, height:38, borderRadius:12, background:`${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{icon}</div>
      </div>

      <div>
        <div style={{ color:'#f9fafb', fontSize:30, fontWeight:800, lineHeight:1.1, letterSpacing:-0.5 }}>{value}</div>
        {sub && <div style={{ color:'#4b5563', fontSize:12, fontWeight:500, marginTop:4 }}>{sub}</div>}
      </div>
    </div>
  );
}
