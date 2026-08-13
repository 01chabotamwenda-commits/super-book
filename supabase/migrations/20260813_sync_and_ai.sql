create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamptz default now()
);

create table if not exists public.workspace_snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  workspace_id text not null,
  payload jsonb not null,
  schema_version integer default 1,
  device_id text not null,
  updated_at timestamptz default now() not null,
  unique (user_id, workspace_id)
);

create table if not exists public.ai_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  request_type text not null,
  input_summary text,
  output jsonb,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
alter table public.workspace_snapshots enable row level security;
alter table public.ai_runs enable row level security;

drop policy if exists "Users can manage their own profile" on public.profiles;
create policy "Users can manage their own profile"
  on public.profiles
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can manage their own snapshots" on public.workspace_snapshots;
create policy "Users can manage their own snapshots"
  on public.workspace_snapshots
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read/write their own AI audit logs" on public.ai_runs;
create policy "Users can read/write their own AI audit logs"
  on public.ai_runs
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);