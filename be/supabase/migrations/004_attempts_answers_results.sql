-- 004_attempts_answers_results.sql
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  student_id uuid not null references public.profiles(user_id) on delete restrict,
  status public.attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attempts_submitted_requires_timestamp
    check ((status = 'submitted' and submitted_at is not null) or (status = 'in_progress'))
);

create table if not exists public.attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  selected_option_index smallint not null check (selected_option_index between 0 and 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null unique references public.attempts(id) on delete restrict,
  exam_id uuid not null references public.exams(id) on delete restrict,
  student_id uuid not null references public.profiles(user_id) on delete restrict,
  score numeric(5,2) not null check (score >= 0),
  correct_count integer not null check (correct_count >= 0),
  total_count integer not null check (total_count > 0),
  submitted_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create trigger trg_attempts_updated_at
before update on public.attempts
for each row execute function public.set_updated_at();

create trigger trg_attempt_answers_updated_at
before update on public.attempt_answers
for each row execute function public.set_updated_at();

create or replace function public.enforce_scheduled_single_submit()
returns trigger
language plpgsql
as $$
declare
  v_exam_type public.exam_type;
begin
  if new.status = 'submitted' and old.status <> 'submitted' then
    select e.type into v_exam_type
    from public.exams e
    where e.id = new.exam_id;

    if v_exam_type = 'scheduled' then
      if exists (
        select 1
        from public.attempts a
        where a.exam_id = new.exam_id
          and a.student_id = new.student_id
          and a.status = 'submitted'
          and a.id <> new.id
      ) then
        raise exception 'scheduled exam allows only one submitted attempt per student';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_enforce_scheduled_single_submit
before update on public.attempts
for each row execute function public.enforce_scheduled_single_submit();

create or replace function public.prevent_results_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'results are immutable';
end;
$$;

create trigger trg_prevent_results_update
before update on public.results
for each row execute function public.prevent_results_mutation();

create trigger trg_prevent_results_delete
before delete on public.results
for each row execute function public.prevent_results_mutation();

create index if not exists idx_attempts_exam_student on public.attempts(exam_id, student_id);
create index if not exists idx_attempts_student_submitted_at on public.attempts(student_id, submitted_at desc);
create index if not exists idx_results_student_submitted_at on public.results(student_id, submitted_at desc);
create index if not exists idx_results_exam_submitted_at on public.results(exam_id, submitted_at desc);
create index if not exists idx_attempt_answers_attempt_id on public.attempt_answers(attempt_id);
