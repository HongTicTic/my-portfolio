-- ============================================================
-- Avatars: profiles table + storage bucket policy
-- Run after schema.sql in the Supabase SQL editor.
--
-- Reminder from the assignment: audit that this locks each user
-- to their OWN folder rather than opening the whole bucket. The
-- folder convention here is <auth.uid()>/<filename> - the app
-- code must upload to that path for these policies to mean anything.
-- ============================================================

-- Public read access makes the generated avatar URLs work in <img src>.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;

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

-- ============================================================
-- Storage policies for the "avatars" bucket
-- storage.foldername(name) splits the object path on "/" into an
-- array, e.g. "abc-123/photo.jpg" -> {abc-123, photo.jpg}, so
-- [1] is the top-level folder. Locking that to auth.uid()::text
-- means a user can only write inside a folder named after their
-- own id - they cannot write into anyone else's folder even
-- though the bucket itself is public for reading.
-- ============================================================

drop policy if exists "avatar_insert_own_folder" on storage.objects;
drop policy if exists "avatar_update_own_folder" on storage.objects;
drop policy if exists "avatar_delete_own_folder" on storage.objects;
drop policy if exists "avatar_public_read" on storage.objects;

create policy "avatar_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bucket is public, so reads work via the public URL regardless,
-- but an explicit select policy keeps behavior consistent if the
-- bucket is ever flipped to private later.
create policy "avatar_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');
