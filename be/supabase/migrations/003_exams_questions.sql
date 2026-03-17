-- 003_exams_questions.sql
create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 255),
  description text,
  type public.exam_type not null,
  duration_minutes integer not null check (duration_minutes between 1 and 300),
  start_time timestamptz,
  created_by uuid references public.profiles(user_id),
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exams_scheduled_requires_start_time
    check ((type = 'scheduled' and start_time is not null) or (type = 'free'))
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  question_text text not null check (char_length(question_text) between 1 and 2000),
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option_index smallint not null check (correct_option_index between 0 and 3),
  explanation text,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_exams_updated_at
before update on public.exams
for each row execute function public.set_updated_at();

create trigger trg_questions_updated_at
before update on public.questions
for each row execute function public.set_updated_at();

create index if not exists idx_exams_type_created_at on public.exams(type, created_at desc);
create index if not exists idx_exams_start_time on public.exams(start_time);
create index if not exists idx_exams_deleted_at on public.exams(deleted_at);
create index if not exists idx_questions_exam_id on public.questions(exam_id);
create index if not exists idx_questions_deleted_at on public.questions(deleted_at);
