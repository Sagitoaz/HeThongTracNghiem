-- rollback 004
drop trigger if exists trg_prevent_results_delete on public.results;
drop trigger if exists trg_prevent_results_update on public.results;
drop function if exists public.prevent_results_mutation();
drop trigger if exists trg_enforce_scheduled_single_submit on public.attempts;
drop function if exists public.enforce_scheduled_single_submit();
drop table if exists public.results cascade;
drop table if exists public.attempt_answers cascade;
drop table if exists public.attempts cascade;
