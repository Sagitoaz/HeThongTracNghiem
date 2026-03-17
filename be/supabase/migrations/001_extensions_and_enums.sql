-- 001_extensions_and_enums.sql
create extension if not exists pgcrypto;

create type public.app_role as enum ('student','admin');
create type public.exam_type as enum ('free','scheduled');
create type public.attempt_status as enum ('in_progress','submitted');
create type public.job_status as enum ('queued','processing','completed','failed');
create type public.export_format as enum ('pdf','xlsx');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
