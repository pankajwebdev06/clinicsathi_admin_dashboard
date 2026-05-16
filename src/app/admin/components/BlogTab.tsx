'use client';
import { useEffect, useState } from 'react';
import { adminBlog, BlogPost } from '@/services/admin.api';

const EMPTY: Partial<BlogPost> = {
  title:'', slug:'', excerpt:'', content:'', category:'',
  cover_emoji:'📝', cover_color_from:'#3b82f6', cover_color_to:'#14b8a6', read_time:'5 min read'
};

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

export default function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<Partial<BlogPost> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [msg, setMsg] = useState('');

  const loadPosts = () => adminBlog.list().then(setPosts).catch(console.error);
  useEffect(() => { loadPosts(); }, []);

  const startNew = () => { setSelected({ ...EMPTY }); setIsNew(true); setPreview(false); setMsg(''); };
  const selectPost = (p: BlogPost) => { setSelected({ ...p }); setIsNew(false); setPreview(false); setMsg(''); };

  const save = async () => {
    if (!selected) return;
    setSaving(true); setMsg('');
    try {
      if (isNew) {
        const r = await adminBlog.create({ ...selected, slug: slugify(selected.title || '') });
        setMsg('✅ Draft created!');
        await loadPosts();
        setIsNew(false);
        setSelected(prev => ({ ...prev, id: r.id, slug: r.slug }));
      } else if (selected.id) {
        await adminBlog.update(selected.id, selected);
        setMsg('✅ Saved!');
        await loadPosts();
      }
    } catch (e: any) { setMsg(`❌ ${e.message}`); }
    finally { setSaving(false); }
  };

  const togglePublish = async () => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      const r = await adminBlog.togglePublish(selected.id);
      setSelected(p => p ? { ...p, published: r.published } : p);
      setMsg(r.published ? '🟢 Published!' : '⚫ Unpublished');
      await loadPosts();
    } catch (e: any) { setMsg(`❌ ${e.message}`); }
    finally { setSaving(false); }
  };

  const deletePost = async () => {
    if (!selected?.id || !confirm('Delete this post?')) return;
    await adminBlog.delete(selected.id);
    setSelected(null);
    await loadPosts();
  };

  return (
    <div style={{ display:'flex', gap:20, height:'calc(100vh - 80px)' }}>

      {/* Left: Post List */}
      <div style={{ width:260, flexShrink:0, background:'#1F2937', borderRadius:20, border:'1px solid rgba(255,255,255,0.06)', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:14 }}>Blog Posts</span>
          <button onClick={startNew} style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ New</button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {posts.length === 0 && <div style={{ color:'#374151', textAlign:'center', padding:24, fontSize:13 }}>No posts yet. Click + New to start.</div>}
          {posts.map(p => (
            <div key={p.id} onClick={() => selectPost(p)} style={{
              padding:'14px 16px', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)',
              background: selected?.id === p.id ? 'rgba(99,102,241,0.12)' : 'transparent', transition:'background 0.1s'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:13, lineHeight:1.3 }}>{p.title || 'Untitled'}</div>
                <span style={{ fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:6, flexShrink:0,
                  background: p.published ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.12)',
                  color: p.published ? '#34d399' : '#818cf8' }}>
                  {p.published ? 'LIVE' : 'DRAFT'}
                </span>
              </div>
              <div style={{ color:'#4b5563', fontSize:11, marginTop:4 }}>{p.category || 'Uncategorized'} · {p.read_time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Editor */}
      {selected ? (
        <div style={{ flex:1, background:'#1F2937', borderRadius:20, border:'1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <button onClick={save} disabled={saving} style={{ background:'rgba(99,102,241,0.2)', border:'1px solid rgba(99,102,241,0.35)', color:'#c4b5fd', borderRadius:10, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {saving ? '…' : '💾 Save Draft'}
            </button>
            {!isNew && (
              <>
                <button onClick={togglePublish} disabled={saving} style={{
                  background: selected.published ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                  border: `1px solid ${selected.published ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                  color: selected.published ? '#f87171' : '#34d399', borderRadius:10, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer'
                }}>{selected.published ? '⚫ Unpublish' : '🟢 Publish'}</button>
                <button onClick={deletePost} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'#f87171', borderRadius:10, padding:'7px 16px', fontSize:12, fontWeight:700, cursor:'pointer' }}>🗑 Delete</button>
              </>
            )}
            <button onClick={() => setPreview(!preview)} style={{ marginLeft:'auto', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', borderRadius:10, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              {preview ? '✏️ Edit' : '👁 Preview'}
            </button>
            {msg && <span style={{ fontSize:12, color: msg.startsWith('✅') || msg.startsWith('🟢') ? '#34d399' : '#f87171', fontWeight:600 }}>{msg}</span>}
          </div>

          {/* Editor / Preview */}
          <div style={{ flex:1, overflowY:'auto', padding:24 }}>
            {preview ? (
              <div>
                <div style={{ background:`linear-gradient(135deg,${selected.cover_color_from||'#3b82f6'},${selected.cover_color_to||'#14b8a6'})`, borderRadius:16, height:140, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, marginBottom:20 }}>{selected.cover_emoji}</div>
                <h1 style={{ color:'#f9fafb', fontSize:26, fontWeight:800 }}>{selected.title || 'Untitled'}</h1>
                <p style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>{selected.category} · {selected.read_time}</p>
                <p style={{ color:'#9ca3af', fontSize:14, marginBottom:24, fontStyle:'italic' }}>{selected.excerpt}</p>
                <div style={{ color:'#d1d5db', fontSize:14, lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'monospace' }}>{selected.content}</div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { label:'Title', key:'title', full:true },
                  { label:'Category', key:'category' },
                  { label:'Read Time', key:'read_time' },
                  { label:'Cover Emoji', key:'cover_emoji' },
                  { label:'Cover Color From', key:'cover_color_from' },
                  { label:'Cover Color To', key:'cover_color_to' },
                ].map(({ label, key, full }) => (
                  <div key={key} style={{ gridColumn: full ? '1 / -1' : undefined }}>
                    <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>{label}</label>
                    <input value={(selected as any)[key] || ''} onChange={e => setSelected(p => p ? { ...p, [key]: e.target.value } : p)}
                      style={{ width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, color:'#f1f5f9', padding:'10px 14px', fontSize:13, outline:'none', boxSizing:'border-box' }} />
                  </div>
                ))}
                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Excerpt</label>
                  <textarea rows={2} value={selected.excerpt || ''} onChange={e => setSelected(p => p ? { ...p, excerpt: e.target.value } : p)}
                    style={{ width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, color:'#f1f5f9', padding:'10px 14px', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }} />
                </div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <label style={{ color:'#6b7280', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8, display:'block', marginBottom:6 }}>Content (Markdown)</label>
                  <textarea rows={16} value={selected.content || ''} onChange={e => setSelected(p => p ? { ...p, content: e.target.value } : p)}
                    style={{ width:'100%', background:'rgba(15,23,42,0.8)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:12, color:'#f1f5f9', padding:'12px 14px', fontSize:13, outline:'none', resize:'vertical', boxSizing:'border-box', fontFamily:'monospace', lineHeight:1.6 }}
                    placeholder="Write your blog post in Markdown..." />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex:1, background:'#1F2937', borderRadius:20, border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
          <div style={{ fontSize:48 }}>✍️</div>
          <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:16 }}>Select a post or create new</div>
          <div style={{ color:'#4b5563', fontSize:13 }}>Published posts appear live on your Blog page</div>
          <button onClick={startNew} style={{ marginTop:8, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', borderRadius:12, padding:'10px 24px', fontSize:14, fontWeight:700, cursor:'pointer' }}>+ New Post</button>
        </div>
      )}
    </div>
  );
}
