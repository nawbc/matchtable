# Production deployment

MatchTable is a pnpm monorepo with two TanStack Start apps:

| App | Package | Dev port | Start command |
| --- | --- | --- | --- |
| Web (user-facing) | `@matchtable/web` | 3000 | `node .output/server/index.mjs` |
| Admin dashboard | `@matchtable/dashboard` | 3001 | `node .output/server/index.mjs` |

Both apps share the same Supabase project. The dashboard additionally requires the service role key for admin-only server functions.

---

## Environment variables

Copy [`.env.example`](../.env.example) to `.env` at the repo root (and optionally per app). Set the same values in your hosting provider’s environment UI.

### Server-side (build + runtime)

| Variable | Required by | Description |
| --- | --- | --- |
| `SUPABASE_URL` | web, dashboard | Supabase project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_ANON_KEY` | web, dashboard | Supabase **anon** (public) key — used by server functions |
| `SUPABASE_SERVICE_ROLE_KEY` | dashboard only | Service role key — **never** expose to the client or `VITE_*` |

Server functions read these at runtime. The dashboard uses the service role for cross-user admin operations (ban/unban, listing all users/reports).

### Client-side (`VITE_*`)

| Variable | Required by | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | web, dashboard | Same value as `SUPABASE_URL` — embedded in the browser bundle |
| `VITE_SUPABASE_ANON_KEY` | web, dashboard | Same value as `SUPABASE_ANON_KEY` — embedded in the browser bundle |

`VITE_*` variables are inlined at **build time**. Rebuild and redeploy after changing them.

### Security notes

- Do **not** prefix `SUPABASE_SERVICE_ROLE_KEY` with `VITE_`.
- Do **not** commit `.env` or real keys to git.
- Use separate Supabase projects for staging and production when possible.

---

## Database migrations

Apply SQL migrations **in order** against your Supabase Postgres database:

1. [`packages/database/migrations/001_initial.sql`](../packages/database/migrations/001_initial.sql) — core schema, RLS, storage bucket
2. [`packages/database/migrations/003_admin.sql`](../packages/database/migrations/003_admin.sql) — admin RLS policies, `is_admin()` helper
3. `packages/database/migrations/004_*.sql` — **apply when present** (not in repo yet; run after 003 if added in a future release)

### How to apply

**Option A — Supabase CLI (linked project):**

```bash
pnpm db:link          # one-time: link to your project ref
pnpm db:push          # pushes migrations from supabase/migrations if configured
```

**Option B — Supabase Dashboard:**

1. **SQL Editor** → New query
2. Paste and run each file in order (001 → 003 → 004 if it exists)
3. Confirm no errors; verify tables and RLS in **Table Editor**

**Option C — CI/CD:**

Run the same ordered SQL as part of your release pipeline or use `supabase db push` from a trusted runner with the project linked.

---

## Supabase Auth

### Providers

Enable in **Authentication → Providers**:

- Google
- Apple
- GitHub
- Phone (OTP)

Configure each provider with the credentials from the respective developer console. See [Supabase Auth docs](https://supabase.com/docs/guides/auth).

### Redirect URLs

Add callback URLs in **Authentication → URL Configuration → Redirect URLs**:

| Environment | Web app | Dashboard |
| --- | --- | --- |
| Local dev | `http://localhost:3000/auth/callback` | `http://localhost:3001/auth/callback` |
| Production | `https://<web-domain>/auth/callback` | `https://<dashboard-domain>/auth/callback` |

Also set **Site URL** to your primary web app origin (e.g. `https://app.example.com` or `http://localhost:3000` for local dev).

OAuth and magic-link flows redirect to `/auth/callback` in each app; both routes exchange the auth code for a session via Supabase.

---

## Admin access (dashboard)

The dashboard requires `app_metadata.role === 'admin'` on the signed-in user.

1. Open **Supabase Dashboard → Authentication → Users**
2. Select the user who should be an admin
3. Edit **Raw User Meta Data** or use the Admin API to set:

```json
{
  "role": "admin"
}
```

This must live under **`app_metadata`**, not `user_metadata`:

```json
{
  "app_metadata": {
    "role": "admin"
  }
}
```

Via Supabase Admin API (server-side only):

```bash
curl -X PUT "https://<ref>.supabase.co/auth/v1/admin/users/<user-uuid>" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"app_metadata":{"role":"admin"}}'
```

RLS policies in `003_admin.sql` use `public.is_admin()`, which reads `auth.jwt() -> 'app_metadata' ->> 'role'`.

---

## Build commands

From the repository root (requires Node.js ≥ 22.12, pnpm 11+):

```bash
vp install

# Web app
vp run @matchtable/web#build
# output: apps/web/.output/

# Admin dashboard
vp run @matchtable/dashboard#build
# output: apps/dashboard/.output/
```

Set all required env vars (including `VITE_*`) before building.

Local smoke check after build:

```bash
vp check
pnpm ready    # vp check && vp run build (web only)
```

---

## Production deployment

Deploy **web** and **dashboard** as separate services (different domains or subdomains). Each service runs the Nitro server bundle produced by `vp build`.

### Generic checklist

1. Create a Supabase production project (or use an existing one).
2. Apply migrations (001 → 003 → 004 if present).
3. Configure Auth providers and redirect URLs (see above).
4. Set environment variables in the host.
5. Build with `VITE_*` and server vars present.
6. Start with `node .output/server/index.mjs` from the app directory (or use Docker — see below).
7. Assign at least one admin user for the dashboard.
8. Verify: sign-in on web, OAuth callback, discover/profile flows; sign-in on dashboard as admin.

### Option A — Vercel / Netlify / similar (Node SSR)

TanStack Start + Nitro emits a Node server under `.output/server/`.

- **Build command:** `vp run @matchtable/web#build` (or dashboard equivalent)
- **Output / root:** `apps/web` (monorepo root directory setting depends on platform)
- **Install:** `vp install` or `pnpm install`
- **Start command:** `node .output/server/index.mjs`
- Set all env vars in the project settings; rebuild when `VITE_*` change.

If the platform expects a single-app repo, set the app root to `apps/web` or `apps/dashboard` and ensure workspace packages resolve (install from monorepo root or use `pnpm deploy` / filter installs).

### Option B — VPS / bare Node

```bash
git clone <repo> && cd matchtable
vp install
cp .env.example .env   # fill in production values
vp run @matchtable/web#build
cd apps/web
NODE_ENV=production node .output/server/index.mjs
```

Run the dashboard on another port or host with the same pattern under `apps/dashboard`. Use a process manager (systemd, PM2) and a reverse proxy (nginx, Caddy) for TLS.

### Option C — Docker

See [`apps/web/Dockerfile`](../apps/web/Dockerfile) and [`docker-compose.yml`](../docker-compose.yml) at the repo root.

```bash
# Build and run web (from repo root)
docker compose up --build web
```

Build args / env must include `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` at image build time; runtime needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optionally `PORT` (default 3000).

---

## CI

GitHub Actions workflow [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs:

- `vp check` — format, lint, typecheck
- `vp run @matchtable/web#build`
- `vp run @matchtable/dashboard#build`

Uses placeholder Supabase env vars so builds succeed without secrets in CI.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| OAuth redirect error | Redirect URL not whitelisted in Supabase Auth settings |
| “Missing VITE_SUPABASE_*” at runtime | `VITE_*` not set during `vp build` |
| Dashboard “Forbidden” after login | User lacks `app_metadata.role = admin` |
| Admin actions fail | `SUPABASE_SERVICE_ROLE_KEY` missing or wrong on dashboard host |
| RLS denies admin reads | Migration `003_admin.sql` not applied |
