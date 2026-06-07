---
name: DLavie OS v2 platform
description: Architecture decisions for v2 upgrade — Supabase, multi-model AI, payments, PWA, deploy
---

## Key decisions

### API client URL prefix
Generated API client (`@workspace/api-client-react`) already embeds `/api/` in every URL path.
`setBaseUrl()` in App.tsx must receive the BASE path only (not `${BASE}/api`) — otherwise you get `/api/api/projects/recent`.
**Why:** orval.config.ts sets `baseUrl: "/api"` baking it into generated paths.
**How to apply:** `setBaseUrl(BASE || null)` where BASE is the vite BASE_URL without trailing slash.

### Manual fetch in pages
Pages that do manual `fetch()` calls (agent.tsx, plans.tsx, dashboard.tsx, models.tsx, settings.tsx) use `const BASE = import.meta.env.BASE_URL.replace(/\/$/,''); const API = ${BASE}/api` — this is correct since they hit `/api/ai/status`, `/api/ai/agent` etc directly.

### Supabase VITE vars
Set via Replit shared env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
Supabase project ref: kqrcglcwkidyrieruxnx.

### Healthz endpoint
API server exposes `/api/healthz` (not `/api/health`). Settings page queries `/api/healthz`.

### PWA
`manifest.json` + `sw.js` in `artifacts/dlavie-os/public/`. SW only registers in production.
index.html updated with `<link rel="manifest">`, apple-mobile-web-app meta tags.

### Capacitor
`capacitor.config.ts` at repo root. `webDir: artifacts/dlavie-os/dist/public`.
Build script: `scripts/build-ios.sh`.

### Vercel deploy
`vercel.json` at repo root. GitHub Actions in `.github/workflows/deploy.yml`.
Setup script: `scripts/setup-vercel.sh`.

### Payment (Midtrans)
Route: `POST /api/me/upgrade` — requires MIDTRANS_SERVER_KEY env var.
Webhook: `POST /api/webhooks/midtrans`.
Plans: free(0), lite(49k), plus(149k), max(349k) IDR/month.

### AI model plans
- free: local-qwen-1.5b only
- lite: + grok-3-mini, gemini-2.0-flash (needs XAI_API_KEY, GEMINI_API_KEY)
- plus: + grok-3, gemini-2.5-pro
- max: all models

### Supabase schema
Run `scripts/supabase-schema.sql` in Supabase SQL editor.
Tables: profiles, usage_logs, subscriptions + trigger auto-creates profile on signup.
