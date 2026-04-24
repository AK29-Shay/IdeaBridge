create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.student_projects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'planning',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  milestone_notes text default '',
  mentor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists student_projects_set_updated_at on public.student_projects;
create trigger student_projects_set_updated_at
before update on public.student_projects
for each row
execute function public.set_updated_at();

alter table public.student_projects enable row level security;

drop policy if exists "Students can select own projects" on public.student_projects;
create policy "Students can select own projects"
on public.student_projects
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "Students can insert own projects" on public.student_projects;
create policy "Students can insert own projects"
on public.student_projects
for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "Students can update own projects" on public.student_projects;
create policy "Students can update own projects"
on public.student_projects
for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "Students can delete own projects" on public.student_projects;
create policy "Students can delete own projects"
on public.student_projects
for delete
to authenticated
using (student_id = auth.uid());
