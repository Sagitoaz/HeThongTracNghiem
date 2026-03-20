package com.httn.codechay.member3.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AttemptRepository {
    private final JdbcTemplate jdbcTemplate;

    public AttemptRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> createAttempt(String examId, String studentId) {
        String sql = """
                with target_exam as (
                    select id, duration_minutes
                    from public.exams
                    where id = cast(? as uuid) and deleted_at is null
                ),
                inserted as (
                    insert into public.attempts (exam_id, student_id, status)
                    select te.id, cast(? as uuid), 'in_progress'
                    from target_exam te
                    returning id, started_at
                )
                select i.id::text as id,
                       i.started_at as "startedAt",
                       te.duration_minutes as "durationMinutes"
                from inserted i
                cross join target_exam te
                """;
        return firstOrNull(jdbcTemplate.queryForList(sql, examId, studentId));
    }

    public Map<String, Object> getAttemptById(String attemptId) {
        String sql = """
                select id::text as id,
                       exam_id::text as "examId",
                       student_id::text as "studentId",
                       status::text as status,
                       started_at as "startedAt",
                       submitted_at as "submittedAt"
                from public.attempts
                where id = cast(? as uuid)
                """;
        return firstOrNull(jdbcTemplate.queryForList(sql, attemptId));
    }

    public Map<String, Object> getSaveAnswerContext(String attemptId, String questionId) {
        String sql = """
                select a.id::text as id,
                       a.exam_id::text as "examId",
                       a.student_id::text as "studentId",
                       a.status::text as status,
                       exists(
                           select 1
                           from public.questions q
                           where q.id = cast(? as uuid)
                             and q.exam_id = a.exam_id
                             and q.deleted_at is null
                       ) as "questionExists"
                from public.attempts a
                where a.id = cast(? as uuid)
                """;
        return firstOrNull(jdbcTemplate.queryForList(sql, questionId, attemptId));
    }

    public Map<String, Object> saveAnswer(String attemptId, String questionId, int selectedOptionIndex) {
        String sql = """
                insert into public.attempt_answers (attempt_id, question_id, selected_option_index)
                values (cast(? as uuid), cast(? as uuid), ?)
                on conflict (attempt_id, question_id)
                do update set
                    selected_option_index = excluded.selected_option_index,
                    updated_at = now()
                returning updated_at as "updatedAt"
                """;
        return firstOrNull(jdbcTemplate.queryForList(sql, attemptId, questionId, selectedOptionIndex));
    }

    public List<Map<String, Object>> getCorrectAnswersByExamId(String examId) {
        String sql = """
                select id::text as "questionId", correct_option_index as "correctOptionIndex"
                from public.questions
                where exam_id = cast(? as uuid) and deleted_at is null
                order by created_at asc
                """;
        return jdbcTemplate.queryForList(sql, examId);
    }

    public List<Map<String, Object>> getAnswersByAttemptId(String attemptId) {
        String sql = """
                select question_id::text as "questionId", selected_option_index as "selectedOptionIndex"
                from public.attempt_answers
                where attempt_id = cast(? as uuid)
                """;
        return jdbcTemplate.queryForList(sql, attemptId);
    }

    public Timestamp submitAttempt(String attemptId, String studentId) {
        String sql = """
                update public.attempts
                set status = 'submitted', submitted_at = now()
                where id = cast(? as uuid)
                  and student_id = cast(? as uuid)
                  and status = 'in_progress'
                returning submitted_at as "submittedAt"
                """;
        Map<String, Object> row = firstOrNull(jdbcTemplate.queryForList(sql, attemptId, studentId));
        if (row == null) {
            return null;
        }
        return (Timestamp) row.get("submittedAt");
    }

    private Map<String, Object> firstOrNull(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }
}
