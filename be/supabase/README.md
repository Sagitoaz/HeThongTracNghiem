# Supabase Database Setup (be-db-supabase)

Folder nay chua day du SQL de dung Supabase cho backend he thong thi trac nghiem.

## Bat dau nhanh (Supabase Dashboard - SQL Editor)

Lam dung thu tu duoi day. Moi buoc:
1) Mo file SQL tu project
2) Copy toan bo noi dung
3) Vao Supabase -> SQL Editor -> New query
4) Paste -> Run

### Thu tu paste SQL
1. `be/supabase/migrations/001_extensions_and_enums.sql`
2. `be/supabase/migrations/002_profiles.sql`
3. `be/supabase/migrations/003_exams_questions.sql`
4. `be/supabase/migrations/004_attempts_answers_results.sql`
5. `be/supabase/migrations/005_jobs_and_audit.sql`
6. `be/supabase/policies/001_rls_policies.sql`
7. `be/supabase/seeds/001_seed_baseline.sql`
8. `be/supabase/tests/001_schema_constraints.sql`
9. `be/supabase/tests/002_rls_smoke.sql`
10. `be/supabase/tests/003_performance_indexes.sql`

## Luu y quan trong truoc khi seed
- `001_seed_baseline.sql` co insert profile dua tren email trong `auth.users`.
- Ban can tao user truoc trong Supabase Auth (vi du `admin@example.com`, `student01@example.com`), neu khong phan insert profile se khong co du lieu.

## Structure
- `migrations/`: forward SQL migrations (001..005)
- `migrations/rollback/`: rollback SQL per migration
- `policies/`: RLS and security policies
- `seeds/`: baseline seed data
- `tests/`: SQL smoke tests for schema, RLS, and indexes

## Suggested Execution Order
1. Run migrations in ascending order:
   - `001_extensions_and_enums.sql`
   - `002_profiles.sql`
   - `003_exams_questions.sql`
   - `004_attempts_answers_results.sql`
   - `005_jobs_and_audit.sql`
2. Apply policies:
   - `policies/001_rls_policies.sql`
3. Run seed baseline:
   - `seeds/001_seed_baseline.sql`
4. Run tests in `tests/`.

## Local Supabase CLI Example
```bash
supabase start
supabase db reset
```

If you manage SQL manually:
```bash
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/001_extensions_and_enums.sql
# ... continue remaining files in order
```

## Cac lenh psql day du (neu ban chay local/terminal)
```bash
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/001_extensions_and_enums.sql
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/002_profiles.sql
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/003_exams_questions.sql
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/004_attempts_answers_results.sql
psql "$SUPABASE_DB_URL" -f be/supabase/migrations/005_jobs_and_audit.sql
psql "$SUPABASE_DB_URL" -f be/supabase/policies/001_rls_policies.sql
psql "$SUPABASE_DB_URL" -f be/supabase/seeds/001_seed_baseline.sql
psql "$SUPABASE_DB_URL" -f be/supabase/tests/001_schema_constraints.sql
psql "$SUPABASE_DB_URL" -f be/supabase/tests/002_rls_smoke.sql
psql "$SUPABASE_DB_URL" -f be/supabase/tests/003_performance_indexes.sql
```

## Rollback
Use matching file in `migrations/rollback/` for targeted rollback.
Always backup before rolling back in shared environments.

## Security Notes
- TLS connection is required in production.
- Keep service-role key out of source code.
- RLS policies are mandatory for user-bound tables.
- `audit_logs` and `results` are designed as append-only/immutable data surfaces.

## Integration Contract for API Unit
- Use `auth.users` + `public.profiles` for identity/roles.
- Enforce exam type rules through DB constraints + triggers.
- Keep `results` immutable once written.
- Use RLS ownership (`auth.uid()`) for student-scoped reads/writes.
