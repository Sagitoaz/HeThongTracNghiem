package com.httn.codechay.member3.repository;

import java.util.Map;
import java.util.List;

import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.JdbcTemplate;


@Repository
public class AttemptRepository {
    private final JdbcTemplate jdbcTemplate;

    public AttemptRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> createAttempt(String examId, String studentId) {
    String sql = """
            insert into public.attempts (exam_id, student_id, status)
            values (cast(? as uuid), cast(? as uuid), 'in_progress')
            returning id::text as id, started_at as "startedAt"
            """;

    List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, examId, studentId);
    if (rows.isEmpty()) {
        return null;
    }
    return rows.get(0);
    }

    public Map<String, Object> getExamForStart(String examId) {
    String sql = """
            select id::text as id, duration_minutes as "durationMinutes"
            from public.exams
            where id = cast(? as uuid) and deleted_at is null
            """;

    List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, examId);
    if (rows.isEmpty()) {
        return null;
    }
    return rows.get(0);
    }

    public Map<String, Object> getAttemptById(String attemptId) {
    String sql = """
            select id::text as id, exam_id::text as "examId", student_id::text as "studentId", status::text as status
            from public.attempts
            where id = cast(? as uuid)
            """;

    List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, attemptId);
    if (rows.isEmpty()) {
        return null;
    }
    return rows.get(0);
    }

    public boolean existsQuestionInExam(String questionId, String examId) {
    String sql = """
            select exists(
                select 1
                from public.questions
                where id = cast(? as uuid)
                  and exam_id = cast(? as uuid)
                  and deleted_at is null
            )
            """;
    Boolean exists = jdbcTemplate.queryForObject(sql, Boolean.class, questionId, examId);
    return Boolean.TRUE.equals(exists);
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

    List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, attemptId, questionId, selectedOptionIndex);
    if (rows.isEmpty()) {
        return null;
    }
    return rows.get(0);
    }

    

}
