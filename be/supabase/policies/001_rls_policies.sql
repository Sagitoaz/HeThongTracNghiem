-- 001_rls_policies.sql
alter table public.profiles enable row level security;
alter table public.exams enable row level security;
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.results enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_job_errors enable row level security;
alter table public.export_jobs enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- profiles
create policy profiles_select_own on public.profiles
for select to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy profiles_update_own on public.profiles
for update to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

-- exams/questions readable by authenticated users, writable by admin
create policy exams_select_auth on public.exams
for select to authenticated
using (deleted_at is null);

create policy exams_admin_write on public.exams
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy questions_select_auth on public.questions
for select to authenticated
using (deleted_at is null);

create policy questions_admin_write on public.questions
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- attempts
create policy attempts_select_own on public.attempts
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy attempts_insert_own on public.attempts
for insert to authenticated
with check (student_id = auth.uid() or public.is_admin());

create policy attempts_update_own on public.attempts
for update to authenticated
using (student_id = auth.uid() or public.is_admin())
with check (student_id = auth.uid() or public.is_admin());

-- answers
create policy answers_select_own on public.attempt_answers
for select to authenticated
using (
  exists (
    select 1 from public.attempts a
    where a.id = attempt_id
      and (a.student_id = auth.uid() or public.is_admin())
  )
);

create policy answers_write_own on public.attempt_answers
for all to authenticated
using (
  exists (
    select 1 from public.attempts a
    where a.id = attempt_id
      and (a.student_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.attempts a
    where a.id = attempt_id
      and (a.student_id = auth.uid() or public.is_admin())
  )
);

-- results
create policy results_select_own on public.results
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy results_insert_admin on public.results
for insert to authenticated
with check (public.is_admin());

-- jobs and audit
create policy import_jobs_admin_all on public.import_jobs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy import_job_errors_admin_all on public.import_job_errors
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy export_jobs_admin_all on public.export_jobs
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy audit_logs_select_admin_or_actor on public.audit_logs
for select to authenticated
using (public.is_admin() or actor_id = auth.uid());

create policy audit_logs_insert_authenticated on public.audit_logs
for insert to authenticated
with check (actor_id = auth.uid() or public.is_admin());
