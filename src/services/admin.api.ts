// =========================================================
// Admin Panel API Service Layer
// All requests use X-Admin-Token header with the admin JWT
// =========================================================

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/v1\/?$/, '');
const ADMIN_PREFIX = `${API_BASE}/api/v1/admin`;

function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_token') || '';
}

function adminHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Admin-Token': getAdminToken(),
  };
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${ADMIN_PREFIX}${path}`, {
    ...options,
    headers: { ...adminHeaders(), ...(options?.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────────────
export const adminAuth = {
  login: async (adminKey: string, adminPassword: string) => {
    const res = await fetch(`${ADMIN_PREFIX}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_key: adminKey, admin_password: adminPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json() as Promise<{ access_token?: string; token_type?: string; require_setup?: boolean; setup_token?: string }>;
  },
  setup: async (setupToken: string, newUserId: string, newPassword: string) => {
    const res = await fetch(`${ADMIN_PREFIX}/auth/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ setup_token: setupToken, new_user_id: newUserId, new_password: newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Setup failed' }));
      throw new Error(err.detail || 'Setup failed');
    }
    return res.json();
  },
  forgot: async (email: string) => {
    const res = await fetch(`${ADMIN_PREFIX}/auth/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || 'Request failed');
    }
    return res.json();
  },
};

// ─── Stats ─────────────────────────────────────────────────────────────
export interface AdminStats {
  total_clinics: number;
  active_clinics: number;
  total_doctors: number;
  total_receptionists: number;
  total_patients: number;
  today_tokens: number;
}

export const adminStats = {
  get: () => adminFetch<AdminStats>('/stats'),
};

// ─── Analytics ─────────────────────────────────────────────────────────
export interface DayPoint { date: string; count: number; }
export interface Analytics {
  clinics_per_day: DayPoint[];
  patients_per_day: DayPoint[];
}

export const adminAnalytics = {
  get: () => adminFetch<Analytics>('/analytics'),
};

// ─── Clinics ───────────────────────────────────────────────────────────
export interface AdminClinic {
  id: string;
  name: string;
  doctor_name: string;
  doctor_mobile: string | null;
  specialization: string | null;
  city: string | null;
  phone: string | null;
  patient_count: number;
  staff_count: number;
  is_active: boolean;
  created_at: string | null;
}

export const adminClinics = {
  list: (search?: string) =>
    adminFetch<AdminClinic[]>(`/clinics${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  toggle: (id: string) =>
    adminFetch<{ id: string; is_active: boolean }>(`/clinics/${id}/toggle`, { method: 'PATCH' }),
};

// ─── Users ─────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  mobile_number: string;
  role: string;
  clinic_id: string;
  clinic_name: string;
  is_active: boolean;
  created_at: string | null;
}

export const adminUsers = {
  list: (role?: string, search?: string) => {
    const params = new URLSearchParams();
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    const qs = params.toString();
    return adminFetch<AdminUser[]>(`/users${qs ? `?${qs}` : ''}`);
  },
};

// ─── Payments ──────────────────────────────────────────────────────────
export interface PaymentRecord {
  id: string;
  clinic_name: string;
  plan: string;
  amount: number;
  status: string;
  payment_method?: string;
  created_at: string | null;
}

export const adminPayments = {
  list: () => adminFetch<PaymentRecord[]>('/payments'),
};

// ─── Blog CMS ──────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  category: string | null;
  cover_emoji: string | null;
  cover_color_from: string | null;
  cover_color_to: string | null;
  read_time: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string | null;
}

export const adminBlog = {
  list: (publishedOnly?: boolean) => {
    const qs = publishedOnly !== undefined ? `?published=${publishedOnly}` : '';
    return adminFetch<BlogPost[]>(`/blog${qs}`);
  },
  get: (slug: string) => adminFetch<BlogPost>(`/blog/${slug}`),
  create: (data: Partial<BlogPost>) =>
    adminFetch<{ id: string; slug: string; message: string }>('/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<BlogPost>) =>
    adminFetch<{ message: string }>(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  togglePublish: (id: string) =>
    adminFetch<{ id: string; published: boolean }>(`/blog/${id}/publish`, { method: 'PATCH' }),
  delete: (id: string) =>
    adminFetch<{ message: string }>(`/blog/${id}`, { method: 'DELETE' }),
};

// ─── Team ──────────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'editor' | 'support';
  is_active: boolean;
  created_at: string | null;
}

export const adminTeam = {
  list: () => adminFetch<TeamMember[]>('/team'),
  add: (data: { name: string; email: string; role: string }) =>
    adminFetch<{ id: string; message: string }>('/team', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    adminFetch<{ message: string }>(`/team/${id}`, { method: 'DELETE' }),
};

// ─── Promo Codes ───────────────────────────────────────────────────────
export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed' | 'free_trial';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  is_public: boolean;
  expires_at: string | null;
  created_at: string | null;
}

export const adminPromoCodes = {
  list: () => adminFetch<PromoCode[]>('/promo-codes'),
  create: (data: Partial<PromoCode> & { discount_type: string; discount_value: number }) =>
    adminFetch<{ id: string; code: string; message: string }>('/promo-codes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<PromoCode>) =>
    adminFetch<PromoCode>(`/promo-codes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  toggle: (id: string) =>
    adminFetch<{ id: string; code: string; is_active: boolean }>(`/promo-codes/${id}/toggle`, {
      method: 'PATCH',
    }),
  delete: (id: string) =>
    adminFetch<{ message: string }>(`/promo-codes/${id}`, { method: 'DELETE' }),
};

// ─── Public Blog (no auth) ─────────────────────────────────────────────
export const publicBlog = {
  listPublished: async (): Promise<BlogPost[]> => {
    const res = await fetch(`${ADMIN_PREFIX}/blog?published=true`);
    if (!res.ok) return [];
    return res.json();
  },
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    const res = await fetch(`${ADMIN_PREFIX}/blog/${slug}`);
    if (!res.ok) return null;
    return res.json();
  },
};
