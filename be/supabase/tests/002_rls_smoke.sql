-- 002_rls_smoke.sql
-- Verify RLS enabled and policy count is present for protected tables.

select relname as table_name, relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and relname in ('profiles','attempts','attempt_answers','results','import_jobs','export_jobs','audit_logs')
order by relname;

select schemaname, tablename, count(*) as policy_count
from pg_policies
where schemaname='public'
group by schemaname, tablename
order by tablename;
