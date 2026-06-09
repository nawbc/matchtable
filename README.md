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
   - `http://localhost:3000/auth/callback`
   - Your production URL + `/auth/callback`
4. Run migrations: `supabase db push` or apply `packages/database/migrations/001_initial.sql` in SQL editor
5. **Storage**: bucket `profile-photos` is created by migration (public read, auth upload to `{user_id}/`)

## Development

Use **Vite+** (`vp`) as the unified toolchain — see [viteplus.dev](https://viteplus.dev/).

```bash
vp install
pnpm dev              # vp run @matchtable/web#dev → http://localhost:3000
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

## Workspace structure

| Path                | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `apps/web`          | User-facing TanStack Start app            |
| `apps/dashboard`    | Admin dashboard (Phase 5 placeholder)     |
| `packages/shared`   | Zod schemas, constants                    |
| `packages/api`      | Supabase clients, Server Function helpers |
| `packages/database` | SQL migrations                            |
| `packages/ui`       | TableCard, CompareTable, design tokens    |
| `packages/config`   | Shared TypeScript / PostCSS config        |
| `supabase/`         | Supabase CLI config                       |
| `docs/prd/`         | Product requirements                      |

## Phase status

- **Phase 0–3**: Scaffold, Auth, Profile CRUD, Discover + Compare
- **Phase 4+**: Favorites, requests, reports, dashboard (not yet implemented)
