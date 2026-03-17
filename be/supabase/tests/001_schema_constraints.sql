-- 001_schema_constraints.sql
-- Run after migrations; script raises exceptions when required objects are missing.

do $$
begin
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='profiles') then
    raise exception 'profiles table missing';
  end if;
  if not exists (select 1 from information_schema.tables where table_schema='public' and table_name='results') then
    raise exception 'results table missing';
  end if;
  if not exists (select 1 from pg_constraint where conname='attempts_submitted_requires_timestamp') then
    raise exception 'attempt status constraint missing';
  end if;
end $$;

select 'ok_schema_constraints' as check_name;
