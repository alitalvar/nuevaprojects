do $$
begin
  if not exists (select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'app_role') then
    create type public.app_role as enum ('admin', 'moderator', 'member');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client text not null,
  project text not null,
  description text,
  date date not null default current_date,
  start_date date not null default current_date,
  deadline date not null default current_date,
  status text not null default 'Ongoing',
  priority text not null default 'P2',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_assignees (
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  primary key (project_id, member_id)
);
