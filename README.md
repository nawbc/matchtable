# MatchTable

Editorial Luxury dating profile platform — TanStack Start + Supabase monorepo, scaffolded with [Vite+](https://viteplus.dev/).

## Prerequisites

- Node.js 22.12+ (managed by `vp env` if using Vite+ CLI)
- pnpm 11+ (managed by Vite+)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for local DB)

## Setup

```bash
vp install
cp .env.example .env
# Fill in Supabase credentials from your project dashboard
```

### Supabase Dashboard (manual)

1. Create a project at [supabase.com](https://supabase.com)
2. **Authentication → Providers**: enable Google, Apple, GitHub, and Phone
3. **Authentication → URL Configuration**: add redirect URLs:
   - `http://localhost:3000/auth/callback` (web app)
   - `http://localhost:3001/auth/callback` (admin dashboard)
   - Production URLs + `/auth/callback` for each deployed app
4. Apply migrations: run SQL in order via Supabase Dashboard SQL Editor (see `pnpm db:migrations`):
   - `packages/database/migrations/001_initial.sql`
   - `packages/database/migrations/003_admin.sql`
   - `packages/database/migrations/004_contact_privacy.sql`
5. **Storage**: bucket `profile-photos` is created by migration (public read, auth upload to `{user_id}/`)
6. **Admin** (dashboard): set `app_metadata.role` to `admin` on a user in Supabase Auth (Dashboard → Authentication → Users → user → Raw user meta data)

## Development

Use **Vite+** (`vp`) as the unified toolchain — see [viteplus.dev](https://viteplus.dev/).

```bash
vp install
pnpm dev              # vp run @matchtable/web#dev → http://localhost:3000
pnpm dev:dashboard    # vp run @matchtable/dashboard#dev → http://localhost:3001
pnpm build            # vp run --filter @matchtable/web build
pnpm check            # vp check — format + lint + typecheck (Oxfmt, Oxlint, tsgo)
pnpm check:fix        # auto-fix where possible
pnpm fmt              # vp fmt
pnpm lint             # vp lint --type-aware --type-check
pnpm ready            # check + build (CI smoke)
```

Direct `vp` from repo root:

```bash
vp run @matchtable/web#dev
vp check
vp run build
vp run ready
```

Config: root [`vite.config.ts`](vite.config.ts) (lint/fmt/run) + [`apps/web/vite.config.ts`](apps/web/vite.config.ts) (TanStack Start).

## Production deployment

See **[`docs/deploy.md`](docs/deploy.md)** for:

- Environment variables (`SUPABASE_*`, `VITE_*`)
- Migration order (`001` → `003` → `004`)
- Supabase Auth providers and redirect URLs (web `:3000`, dashboard `:3001`)
- Admin role (`app_metadata.role = admin`)
- Build commands (`vp run @matchtable/web#build`, `vp run @matchtable/dashboard#build`)
- Vercel / Node / Docker deployment options

Quick build:

```bash
vp run @matchtable/web#build
vp run @matchtable/dashboard#build
```

Optional: [`apps/web/Dockerfile`](apps/web/Dockerfile) + [`docker-compose.yml`](docker-compose.yml). CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Workspace structure

| Path                | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `apps/web`          | User-facing TanStack Start app                   |
| `apps/dashboard`    | Admin dashboard (users, profiles, reports)       |
| `packages/shared`   | Zod schemas, constants                           |
| `packages/api`      | Supabase clients, Server Function helpers        |
| `packages/database` | SQL migrations (`packages/database/migrations/`) |
| `packages/ui`       | TableCard, CompareTable, design tokens           |
| `packages/config`   | Shared TypeScript / PostCSS config               |
| `docs/prd/`         | Product requirements                             |

## Phase status

MVP Phases 0–6 are implemented in code. Remaining work: Supabase project setup, admin role assignment, and following [`docs/deploy.md`](docs/deploy.md) for production.

| Phase | Scope                                             | Status |
| ----- | ------------------------------------------------- | ------ |
| 0     | Monorepo scaffold, Vite+, TanStack Start          | Done   |
| 1     | Auth (register, login, OAuth callback)            | Done   |
| 2     | Profile CRUD, photos (1–9, reorder, primary)      | Done   |
| 3     | Discover, search, filter, compare (2–4, pin own)  | Done   |
| 4     | Favorites, connection requests, contact unlock    | Done   |
| 5     | User reports                                      | Done   |
| 6     | Admin dashboard (users, profiles, reports, stats) | Done   |

See `docs/prd/12-dev-standards.md` for the full MVP acceptance checklist.
