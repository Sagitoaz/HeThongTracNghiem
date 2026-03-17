-- rollback 001
drop function if exists public.set_updated_at() cascade;
drop type if exists public.export_format;
drop type if exists public.job_status;
drop type if exists public.attempt_status;
drop type if exists public.exam_type;
drop type if exists public.app_role;
