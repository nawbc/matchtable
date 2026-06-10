-- MatchTable Phase A1: contact privacy RLS isolation
-- Move contact fields from profiles to profile_contacts with restrictive RLS

create table if not exists public.profile_contacts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  wechat text,
  line text,
  telegram text,
  email text,
  updated_at timestamptz default now()
);

create trigger profile_contacts_updated_at
  before update on public.profile_contacts
  for each row execute function public.set_updated_at();

-- Migrate existing contact data
insert into public.profile_contacts (profile_id, wechat, line, telegram, email)
select id, wechat, line, telegram, email
from public.profiles
on conflict (profile_id) do update set
  wechat = excluded.wechat,
  line = excluded.line,
  telegram = excluded.telegram,
  email = excluded.email;

alter table public.profiles drop column if exists wechat;
alter table public.profiles drop column if exists telegram;
alter table public.profiles drop column if exists line;
alter table public.profiles drop column if exists email;

alter table public.profile_contacts enable row level security;

-- Profile owner: full access to own contacts
create policy "Owners manage own contacts"
  on public.profile_contacts for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

-- Accepted connection: read-only access to the other party's contacts
create policy "Accepted connections read contacts"
  on public.profile_contacts for select
  using (
    exists (
      select 1
      from public.profiles p
      join public.requests r on r.status = 'accepted'
      where p.id = profile_contacts.profile_id
      and (
        (r.from_user_id = auth.uid() and r.to_user_id = p.user_id)
        or (r.to_user_id = auth.uid() and r.from_user_id = p.user_id)
      )
    )
  );

-- Admin dashboard access
create policy "Admins read all contacts"
  on public.profile_contacts for select
  using (public.is_admin());

create policy "Admins update all contacts"
  on public.profile_contacts for update
  using (public.is_admin());
