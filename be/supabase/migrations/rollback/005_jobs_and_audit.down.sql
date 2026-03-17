-- rollback 005
drop trigger if exists trg_prevent_audit_delete on public.audit_logs;
drop trigger if exists trg_prevent_audit_update on public.audit_logs;
drop function if exists public.prevent_audit_mutation();
drop table if exists public.audit_logs cascade;
drop table if exists public.export_jobs cascade;
drop table if exists public.import_job_errors cascade;
drop table if exists public.import_jobs cascade;
