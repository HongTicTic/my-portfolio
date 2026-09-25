-- ============================================================
-- Habit Tracker schema
-- Run this in the Supabase SQL editor.
--
-- NOTE: your assignment says to hand-write the RLS policies
-- yourself so you understand every clause. Treat the policy
-- block below as a reference to check your work against, not
-- something to paste blindly - type it out and make sure you
-- can explain what auth.uid() = user_id is doing before you run it.
-- ============================================================

-- ---------- profiles ----------
-- Public user information. Authentication credentials remain in
-- Supabase's protected auth.users table.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- user_auth ----------
-- Safe authentication metadata only. Never store passwords or tokens here.
create table if not exists user_auth (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  provider text not null default 'email',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep the public rows synchronized with Supabase Auth users.
create or replace function public.sync_user_records()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.user_auth (
    user_id,
    email,
    email_confirmed_at,
    last_sign_in_at,
    provider
  )
  values (
    new.id,
    new.email,
    new.email_confirmed_at,
    new.last_sign_in_at,
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  )
  on conflict (user_id) do update set
    email = excluded.email,
    email_confirmed_at = excluded.email_confirmed_at,
    last_sign_in_at = excluded.last_sign_in_at,
    provider = excluded.provider,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_changed on auth.users;
create trigger on_auth_user_changed
  after insert or update on auth.users
  for each row execute procedure public.sync_user_records();

-- Backfill users that existed before this schema was installed.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

insert into public.user_auth (
  user_id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  provider
)
select
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  coalesce(raw_app_meta_data ->> 'provider', 'email')
from auth.users
on conflict (user_id) do update set
  email = excluded.email,
  email_confirmed_at = excluded.email_confirmed_at,
  last_sign_in_at = excluded.last_sign_in_at,
  provider = excluded.provider,
  updated_at = now();

-- ---------- habits ----------
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- daily_logs ----------
-- One row per habit per day it was completed.
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

-- ---------- seed data ----------
-- Replace YOUR_USER_ID with a real auth.users.id after you've
-- signed up once (Table Editor > authentication > users).
-- insert into habits (user_id, name) values
--   ('YOUR_USER_ID', 'Drink water'),
--   ('YOUR_USER_ID', 'Read 10 pages'),
--   ('YOUR_USER_ID', 'Stretch');

-- ============================================================
-- Row Level Security
-- ============================================================

alter table habits enable row level security;
alter table daily_logs enable row level security;
alter table profiles enable row level security;
alter table user_auth enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "user_auth_select_own"
  on user_auth for select
  using (auth.uid() = user_id);

-- habits: a user may only see/change rows where the row's
-- user_id column matches their own auth uid. auth.uid() is the
-- id Supabase extracts from the caller's JWT on every request -
-- it can't be spoofed by the client because it's read off the
-- signed token server-side, not sent as a parameter.

create policy "habits_select_own"
  on habits for select
  using (auth.uid() = user_id);

create policy "habits_insert_own"
  on habits for insert
  with check (auth.uid() = user_id);

create policy "habits_update_own"
  on habits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habits_delete_own"
  on habits for delete
  using (auth.uid() = user_id);

-- daily_logs: same pattern. Note this table also has its own
-- user_id (denormalized) rather than relying on a join through
-- habits - simpler and faster for RLS to check directly.

create policy "daily_logs_select_own"
  on daily_logs for select
  using (auth.uid() = user_id);

create policy "daily_logs_insert_own"
  on daily_logs for insert
  with check (auth.uid() = user_id);

create policy "daily_logs_update_own"
  on daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_logs_delete_own"
  on daily_logs for delete
  using (auth.uid() = user_id);
