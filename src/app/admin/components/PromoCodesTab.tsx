'use client';
import { useEffect, useState } from 'react';
import { adminPromoCodes, PromoCode } from '@/services/admin.api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function discountLabel(p: PromoCode): string {
  if (p.discount_type === 'free_trial') {
    const months = Math.round(p.discount_value / 30);
    return `${months} Month${months > 1 ? 's' : ''} Free`;
  }
  if (p.discount_type === 'percent') return `${p.discount_value}% Off`;
  return `₹${p.discount_value} Off`;
}

function usageBar(p: PromoCode) {
  if (!p.max_uses) return null;
  const pct = Math.round((p.used_count / p.max_uses) * 100);
  return { pct, remaining: p.max_uses - p.used_count };
}

const TYPE_OPTIONS = [
  { value: 'free_trial', label: '🎁 Free Trial (N days at ₹0)' },
  { value: 'percent',    label: '% Percent Discount' },
  { value: 'fixed',      label: '₹ Fixed Amount Off' },
];

const INPUT_STYLE: React.CSSProperties = {
  background: '#1e293b', border: '1px solid #334155', borderRadius: 10,
  color: '#f1f5f9', padding: '10px 14px', fontSize: 13, width: '100%',
  outline: 'none',
};
const LABEL_STYLE: React.CSSProperties = {
  color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: 0.8, marginBottom: 5, display: 'block',
};

// ── Empty form state ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'free_trial' as PromoCode['discount_type'],
  discount_value: '',
  max_uses: '',
  is_active: true,
  is_public: true,
  expires_at: '',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PromoCodesTab() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminPromoCodes.list();
      setPromos(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load promo codes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const updated = await adminPromoCodes.toggle(id);
      setPromos(prev =>
        prev.map(p => p.id === id ? { ...p, is_active: updated.is_active } : p)
      );
    } catch (e: any) {
      alert(e.message || 'Toggle failed.');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete promo code "${code}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminPromoCodes.delete(id);
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.message || 'Delete failed.');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await adminPromoCodes.create({
        code: form.code.toUpperCase().trim(),
        description: form.description || undefined,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        max_uses: form.max_uses ? parseInt(form.max_uses) : undefined,
        is_active: form.is_active,
        is_public: form.is_public,
        expires_at: form.expires_at || undefined,
      });
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      await load();
    } catch (e: any) {
      setSaveError(e.message || 'Failed to create promo code.');
    } finally {
      setSaving(false);
    }
  };

  const valueLabel = (type: string) => {
    if (type === 'free_trial') return 'Trial Days (e.g. 90 = 3 months)';
    if (type === 'percent') return 'Discount % (e.g. 20)';
    return 'Discount Amount ₹ (e.g. 200)';
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ color: '#f1f5f9', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>
            🎟️ Promo Codes
          </h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Create & manage discount / free-trial coupons. Changes reflect instantly on the frontend.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(s => !s); setSaveError(''); }}
          style={{
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 20px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', minHeight: 44,
          }}
        >
          {showForm ? '✕ Cancel' : '+ New Promo Code'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{
          background: '#111827', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 18, padding: 24, marginBottom: 28,
        }}>
          <h3 style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>
            New Promo Code
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>

            {/* Code */}
            <div>
              <label style={LABEL_STYLE}>Code *</label>
              <input
                style={{ ...INPUT_STYLE, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }}
                placeholder="FIRST100"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>

            {/* Type */}
            <div>
              <label style={LABEL_STYLE}>Discount Type *</label>
              <select
                style={{ ...INPUT_STYLE }}
                value={form.discount_type}
                onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as any }))}
              >
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label style={LABEL_STYLE}>{valueLabel(form.discount_type)} *</label>
              <input
                style={INPUT_STYLE}
                type="number"
                min="1"
                placeholder={form.discount_type === 'free_trial' ? '90' : form.discount_type === 'percent' ? '20' : '200'}
                value={form.discount_value}
                onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
              />
            </div>

            {/* Max Uses */}
            <div>
              <label style={LABEL_STYLE}>Max Uses (blank = unlimited)</label>
              <input
                style={INPUT_STYLE}
                type="number"
                min="1"
                placeholder="100"
                value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              />
            </div>

            {/* Expires At */}
            <div>
              <label style={LABEL_STYLE}>Expires At (optional)</label>
              <input
                style={INPUT_STYLE}
                type="datetime-local"
                value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={LABEL_STYLE}>Description (shown to users)</label>
              <input
                style={INPUT_STYLE}
                placeholder="e.g. First 100 doctors get 3 months free!"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, gridColumn: '1 / -1' }}>
              {[
                { key: 'is_active', label: 'Active (can be used)' },
                { key: 'is_public', label: 'Public (visible on frontend)' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#94a3b8' }}>
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: '#6366f1' }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {saveError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 10, padding: '10px 14px', marginTop: 16, fontSize: 13 }}>
              {saveError}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={saving || !form.code || !form.discount_value}
            style={{
              marginTop: 20, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 28px', fontWeight: 700, fontSize: 13,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: (saving || !form.code || !form.discount_value) ? 0.5 : 1,
              minHeight: 44,
            }}
          >
            {saving ? 'Creating...' : 'Create Promo Code'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 14, padding: '16px 20px', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading promo codes…
        </div>
      ) : promos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#475569' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎟️</div>
          <div style={{ fontWeight: 600 }}>No promo codes yet.</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Create your first one above.</div>
        </div>
      ) : (
        /* Table */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
            <thead>
              <tr>
                {['Code', 'Type & Value', 'Usage', 'Status', 'Expires', 'Actions'].map(h => (
                  <th key={h} style={{ color: '#475569', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, padding: '4px 14px', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promos.map(p => {
                const bar = usageBar(p);
                const isExpired = p.expires_at ? new Date(p.expires_at) < new Date() : false;
                return (
                  <tr key={p.id}>
                    <td style={{ background: '#111827', borderRadius: '14px 0 0 14px', padding: '14px 14px' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 14, color: '#c4b5fd' }}>
                        {p.code}
                      </div>
                      {p.description && (
                        <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>{p.description}</div>
                      )}
                      {!p.is_public && (
                        <span style={{ background: '#1e293b', color: '#94a3b8', fontSize: 10, padding: '2px 6px', borderRadius: 6, marginTop: 4, display: 'inline-block' }}>
                          🔒 Hidden
                        </span>
                      )}
                    </td>
                    <td style={{ background: '#111827', padding: '14px 14px' }}>
                      <span style={{
                        background: p.discount_type === 'free_trial' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                        color: p.discount_type === 'free_trial' ? '#34d399' : '#a5b4fc',
                        padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      }}>
                        {discountLabel(p)}
                      </span>
                    </td>
                    <td style={{ background: '#111827', padding: '14px 14px', minWidth: 120 }}>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {p.used_count} used
                        {p.max_uses ? ` / ${p.max_uses}` : ' (unlimited)'}
                      </div>
                      {bar && (
                        <div style={{ marginTop: 4, height: 4, borderRadius: 4, background: '#1e293b', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 4,
                            width: `${bar.pct}%`,
                            background: bar.pct >= 90 ? '#f87171' : bar.pct >= 60 ? '#fbbf24' : '#34d399',
                            transition: 'width 0.3s',
                          }} />
                        </div>
                      )}
                    </td>
                    <td style={{ background: '#111827', padding: '14px 14px' }}>
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={toggling === p.id}
                        style={{
                          padding: '5px 14px', borderRadius: 20, border: 'none',
                          fontWeight: 700, fontSize: 12, cursor: 'pointer',
                          minHeight: 32,
                          background: p.is_active
                            ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                          color: p.is_active ? '#34d399' : '#64748b',
                        }}
                      >
                        {toggling === p.id ? '...' : p.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ background: '#111827', padding: '14px 14px', fontSize: 12 }}>
                      {p.expires_at ? (
                        <span style={{ color: isExpired ? '#f87171' : '#94a3b8' }}>
                          {isExpired ? '⚠ Expired' : ''}
                          {new Date(p.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span style={{ color: '#475569' }}>Never</span>
                      )}
                    </td>
                    <td style={{ background: '#111827', borderRadius: '0 14px 14px 0', padding: '14px 14px' }}>
                      <button
                        onClick={() => handleDelete(p.id, p.code)}
                        disabled={deleting === p.id}
                        style={{
                          background: 'rgba(239,68,68,0.1)', color: '#f87171',
                          border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
                          padding: '6px 12px', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', minHeight: 32,
                        }}
                      >
                        {deleting === p.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
