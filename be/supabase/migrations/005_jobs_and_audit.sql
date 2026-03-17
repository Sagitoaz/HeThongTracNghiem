-- 005_jobs_and_audit.sql
create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  requested_by uuid not null references public.profiles(user_id) on delete restrict,
  status public.job_status not null default 'queued',
  imported_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.import_job_errors (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  error_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(user_id) on delete restrict,
  scope_type text not null check (scope_type in ('exam', 'student')),
  scope_id uuid not null,
  format public.export_format not null,
  status public.job_status not null default 'queued',
  output_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(user_id),
  actor_role public.app_role,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create trigger trg_import_jobs_updated_at
before update on public.import_jobs
for each row execute function public.set_updated_at();

create trigger trg_export_jobs_updated_at
before update on public.export_jobs
for each row execute function public.set_updated_at();

create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs are append-only';
end;
$$;

create trigger trg_prevent_audit_update
before update on public.audit_logs
for each row execute function public.prevent_audit_mutation();

create trigger trg_prevent_audit_delete
before delete on public.audit_logs
for each row execute function public.prevent_audit_mutation();

create index if not exists idx_import_jobs_exam_status on public.import_jobs(exam_id, status);
create index if not exists idx_export_jobs_scope_status on public.export_jobs(scope_type, scope_id, status);
create index if not exists idx_audit_logs_actor_time on public.audit_logs(actor_id, occurred_at desc);
create index if not exists idx_audit_logs_resource_time on public.audit_logs(resource_type, resource_id, occurred_at desc);
