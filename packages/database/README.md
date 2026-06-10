# MatchTable database migrations

SQL migrations live in `packages/database/migrations/`. Apply them **in order** against your Supabase Postgres database.

## Migration order

| Order | File                      | Purpose                                                     |
| ----- | ------------------------- | ----------------------------------------------------------- |
| 1     | `001_initial.sql`         | Core schema, RLS, storage bucket                            |
| 2     | `003_admin.sql`           | Admin RLS policies, `is_admin()` helper                     |
| 3     | `004_contact_privacy.sql` | Contact fields moved to `profile_contacts` with privacy RLS |

> Migration `002` was never used; do not skip `003`.

## Apply migrations

### Option A — Supabase Dashboard (recommended for new projects)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → New query.
3. Paste and run each file above in order.
4. Confirm no errors in **Table Editor** (tables: `profiles`, `profile_photos`, `profile_contacts`, `favorites`, `requests`, `reports`).

### Option B — Supabase CLI

```bash
# From repo root — link your project (one-time)
pnpm db:link

# Print migration paths (manual apply via psql or SQL Editor)
pnpm db:migrations
```

If you symlink or copy migrations into `supabase/migrations/`, you can use `pnpm db:push`.

## Post-migration setup

1. **Authentication → Providers**: enable Google, Apple, GitHub, and Phone.
2. **Authentication → URL Configuration**: add redirect URLs for web (`:3000`) and dashboard (`:3001`).
3. **Storage**: bucket `profile-photos` is created by `001_initial.sql`.
4. **Admin**: set `app_metadata.role` to `admin` on a user for the dashboard.

See root [`README.md`](../../README.md) and [`docs/deploy.md`](../../docs/deploy.md) for environment variables and deployment.
