<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 🚀 Project Vision
All development MUST follow the [PROJECT_VISION.md](../PROJECT_VISION.md) blueprint.

## 🧩 Component-First Rule (CRITICAL)
**New admin features ship as new tab components — never as rewrites.**

- ✅ New section → new component in `src/app/admin/components/` + add to `AdminTab` union + register in `CONTENT` map in `page.tsx`
- ✅ Reuse `StatCard`, `AdminSidebar`, etc. before re-inventing
- ❌ Do NOT rewrite `page.tsx`, `AdminSidebar.tsx`, or other shared scaffolding
- ❌ Do NOT change the admin API client signatures in `services/admin.api.ts`

The admin dashboard is **live** and used by the internal team. Breaking changes cost real operational time.

## 📱 Mobile-First Rule
Even for an internal tool, admins triage clinic issues from their phone. Every tab must work cleanly at 375 px.
- Sidebar collapses to a bottom drawer on mobile
- Touch targets ≥ 44 px
- Tables become stacked cards below `md:`

## 🌐 Live Deployment
- Backend: https://clinicsathi-backend.onrender.com (Render free tier, 30–45 s cold start)
- Admin URL: separate Vercel project
- Set `NEXT_PUBLIC_API_URL` in env to point at the backend

## 🗄️ Offline-First (TODO)
The doctor frontend already uses Dexie (`clinicflow-frontend/src/lib/db/schema.ts`) with a sync queue. The admin dashboard needs the same treatment so reports stay readable when the network blips. Mirror that pattern when implementing.
<!-- END:nextjs-agent-rules -->
