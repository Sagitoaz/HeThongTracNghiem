-- 003_performance_indexes.sql
-- Verify important indexes for result/statistics queries.

select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_results_student_submitted_at',
    'idx_results_exam_submitted_at',
    'idx_attempts_exam_student',
    'idx_attempts_student_submitted_at'
  )
order by indexname;
