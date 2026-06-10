-- MatchTable Phase 5: admin auth + status documentation
--
-- profiles.status values:
--   active   - visible in discover and public profile pages
--   hidden   - draft / unpublished (Phase 3 onboarding)
--   takedown - admin removed from public view
--   deleted  - soft-deleted profile
--
-- reports.status values:
--   pending  - awaiting admin review
--   resolved - admin has handled the report

comment on column public.profiles.status is 'active | hidden | takedown | deleted';
comment on column public.reports.status is 'pending | resolved';

-- Admin check via JWT app_metadata.role (set in Supabase Auth)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Admin policies for dashboard (reports management)
create policy "Admins read all reports"
  on public.reports for select
  using (public.is_admin());

create policy "Admins update reports"
  on public.reports for update
  using (public.is_admin());

-- Admin policies for dashboard (profile management)
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- Indexes for admin dashboard queries
create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index if not exists reports_target_user_id_idx
  on public.reports (target_user_id);

create index if not exists reports_reporter_id_idx
  on public.reports (reporter_id);
