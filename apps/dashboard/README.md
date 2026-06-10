# MatchTable Admin Dashboard

Admin dashboard for MatchTable — user, profile, and report management.

## Development

```bash
# From repo root (requires .env with SUPABASE_* and VITE_SUPABASE_*)
pnpm dev:dashboard
# or
vp dev apps/dashboard
```

Runs on http://localhost:3001 by default.

## Admin access

Set `app_metadata.role` to `admin` on the user in Supabase Auth. Non-admin users are redirected to `/login`.

## Routes

| Path            | Description                             |
| --------------- | --------------------------------------- |
| `/`             | Dashboard stats                         |
| `/users`        | User search and management              |
| `/users/$id`    | User detail, ban/unban                  |
| `/profiles`     | Profile list                            |
| `/profiles/$id` | Profile detail, takedown, delete        |
| `/reports`      | Report list, resolve, ban reported user |
