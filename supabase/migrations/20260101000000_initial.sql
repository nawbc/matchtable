-- MatchTable initial schema
-- profiles, profile_photos, favorites, requests, reports + RLS + storage

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text,
  gender text,
  birthday date,
  avatar_url text,
  height int,
  weight int,
  education text,
  school text,
  city text,
  occupation text,
  income text,
  house boolean default false,
  car boolean default false,
  marital_status text,
  accept_ldr boolean default false,
  hobbies text[],
  requirements text,
  bio text,
  wechat text,
  telegram text,
  line text,
  email text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Public can read active profiles"
  on public.profiles for select
  using (status = 'active');

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- profile_photos
create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.profile_photos enable row level security;

create policy "Photos readable with active profile"
  on public.profile_photos for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
      and (p.status = 'active' or p.user_id = auth.uid())
    )
  );

create policy "Users can manage own profile photos"
  on public.profile_photos for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

-- favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, profile_id)
);

alter table public.favorites enable row level security;

create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id);

-- requests
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references auth.users(id) on delete cascade,
  to_user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.requests enable row level security;

create policy "Users read own requests"
  on public.requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users create requests"
  on public.requests for insert
  with check (auth.uid() = from_user_id);

create policy "Users update own requests"
  on public.requests for update
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  detail text,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.reports enable row level security;

create policy "Users create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "Users read own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

-- storage bucket for profile photos
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Public read profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "Users upload own profile photos"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own profile photos"
  on storage.objects for update
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own profile photos"
  on storage.objects for delete
  using (
    bucket_id = 'profile-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- indexes
create index if not exists profiles_status_created_at_idx on public.profiles (status, created_at desc);
create index if not exists profiles_city_idx on public.profiles (city);
create index if not exists profiles_gender_idx on public.profiles (gender);
create index if not exists profile_photos_profile_id_idx on public.profile_photos (profile_id, sort_order);
