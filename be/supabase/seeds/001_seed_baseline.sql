-- 001_seed_baseline.sql
-- Note: create auth users first via Supabase Auth dashboard/API.

insert into public.profiles (user_id, username, email, role)
select u.id, 'admin', u.email, 'admin'::public.app_role
from auth.users u
where u.email = 'admin@example.com'
on conflict (user_id) do update
set username = excluded.username,
    email = excluded.email,
    role = excluded.role;

insert into public.profiles (user_id, username, email, role)
select u.id, 'student01', u.email, 'student'::public.app_role
from auth.users u
where u.email = 'student01@example.com'
on conflict (user_id) do update
set username = excluded.username,
    email = excluded.email,
    role = excluded.role;

insert into public.exams (id, name, description, type, duration_minutes, start_time)
values
  (gen_random_uuid(), 'Luyen tap co so mang', 'De free de test API', 'free', 30, null),
  (gen_random_uuid(), 'Thi giua ky mang', 'De scheduled de test rule 1 lan nop bai', 'scheduled', 45, now() + interval '1 day')
on conflict do nothing;

with target_exam as (
  select id from public.exams where type = 'free' order by created_at asc limit 1
)
insert into public.questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation)
select
  t.id,
  'Mo hinh OSI co bao nhieu tang?',
  '5',
  '6',
  '7',
  '8',
  2,
  'Mo hinh OSI gom 7 tang.'
from target_exam t
where not exists (
  select 1 from public.questions q where q.exam_id = t.id
);
