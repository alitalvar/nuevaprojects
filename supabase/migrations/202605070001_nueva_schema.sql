create type public.app_role as enum ('admin', 'moderator', 'member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.projects (
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

create table public.project_assignees (
  project_id uuid not null references public.projects(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  primary key (project_id, member_id)
);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do update
    set email = excluded.email,
        display_name = excluded.display_name;

  insert into public.user_roles (user_id, role)
  values (new.id, 'member')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_project_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_project_updated_at();

create or replace function public.validate_project_dates()
returns trigger
language plpgsql
as $$
begin
  if new.deadline < new.start_date then
    raise exception 'Project deadline cannot be earlier than start date';
  end if;
  return new;
end;
$$;

create trigger projects_validate_dates
before insert or update on public.projects
for each row execute function public.validate_project_dates();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.members enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignees enable row level security;

create policy "Users read own profile" on public.profiles
for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create policy "Users update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Admins read roles" on public.user_roles
for select to authenticated using (public.has_role(auth.uid(), 'admin') or user_id = auth.uid());

create policy "Admins manage roles" on public.user_roles
for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated read members" on public.members
for select to authenticated using (true);

create policy "Admins manage members" on public.members
for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated read projects" on public.projects
for select to authenticated using (true);

create policy "Admins manage projects" on public.projects
for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Assigned members update project status" on public.projects
for update to authenticated
using (
  exists (
    select 1
    from public.project_assignees pa
    join public.members m on m.id = pa.member_id
    where pa.project_id = projects.id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.project_assignees pa
    join public.members m on m.id = pa.member_id
    where pa.project_id = projects.id
      and m.user_id = auth.uid()
  )
);

create policy "Authenticated read assignees" on public.project_assignees
for select to authenticated using (true);

create policy "Admins manage assignees" on public.project_assignees
for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

create policy "Public read avatars" on storage.objects
for select using (bucket_id = 'avatars');

create policy "Admins upload avatars" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update avatars" on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete avatars" on storage.objects
for delete to authenticated
using (bucket_id = 'avatars' and public.has_role(auth.uid(), 'admin'));
