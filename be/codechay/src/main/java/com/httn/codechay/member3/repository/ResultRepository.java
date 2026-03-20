package com.httn.codechay.member3.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ResultRepository {
    private final JdbcTemplate jdbcTemplate;

    public ResultRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsResultByAttemptId(String attemptId) {
        String sql = """
                select exists(
                    select 1
                    from public.results
                    where attempt_id = cast(? as uuid)
                )
                """;
        Boolean exists = jdbcTemplate.queryForObject(sql, Boolean.class, attemptId);
        return Boolean.TRUE.equals(exists);
    }

    public Map<String, Object> createResult(
            String attemptId,
            String examId,
            String studentId,
            double score,
            int correctCount,
            int totalCount,
            Timestamp submittedAt,
            int durationSeconds
    ) {
        String sql = """
                insert into public.results (
                    attempt_id, exam_id, student_id,
                    score, correct_count, total_count,
                    submitted_at, duration_seconds
                )
                values (cast(? as uuid), cast(? as uuid), cast(? as uuid), ?, ?, ?, ?, ?)
                returning id::text as id, submitted_at as "submittedAt"
                """;
        return firstOrNull(jdbcTemplate.queryForList(
                sql,
                attemptId,
                examId,
                studentId,
                score,
                correctCount,
                totalCount,
                submittedAt,
                durationSeconds
        ));
    }

    public Map<String, Object> getResultByResultId(String resultId) {
        String sql = """
                select id::text as id,
                       attempt_id::text as "attemptId",
                       exam_id::text as "examId",
                       student_id::text as "studentId",
                       score,
                       correct_count as "correct",
                       total_count as "total",
                       submitted_at as "submittedAt",
                       duration_seconds as "durationSeconds"
                from public.results
                where id = cast(? as uuid)
                """;
        return firstOrNull(jdbcTemplate.queryForList(sql, resultId));
    }

    public List<Map<String, Object>> getResultAnswersByResultId(String resultId) {
        String sql = """
                select aa.question_id::text as "questionId",
                       aa.selected_option_index as "selectedOptionIndex",
                       q.correct_option_index as "correctOptionIndex",
                       (aa.selected_option_index = q.correct_option_index) as "isCorrect",
                       q.explanation as "explanation"
                from public.results r
                join public.attempt_answers aa on aa.attempt_id = r.attempt_id
                join public.questions q on q.id = aa.question_id
                where r.id = cast(? as uuid)
                order by aa.created_at asc
                """;
        return jdbcTemplate.queryForList(sql, resultId);
    }

    public List<Map<String, Object>> getMyResults(String studentId, String examId, int size, int offset) {
        String sql = """
                select r.id::text as id,
                       r.exam_id::text as "examId",
                       e.name as "examName",
                       r.student_id::text as "userId",
                       p.username as username,
                       r.score,
                       r.correct_count as correct,
                       r.total_count as total,
                       r.submitted_at as "submittedAt",
                       r.duration_seconds as "durationSeconds"
                from public.results r
                left join public.exams e on e.id = r.exam_id
                left join public.profiles p on p.user_id = r.student_id
                where r.student_id = cast(? as uuid)
                  and (cast(? as uuid) is null or r.exam_id = cast(? as uuid))
                order by r.submitted_at desc
                limit ? offset ?
                """;
        return jdbcTemplate.queryForList(sql, studentId, examId, examId, size, offset);
    }

    public int countMyResults(String studentId, String examId) {
        String sql = """
                select count(*)
                from public.results r
                where r.student_id = cast(? as uuid)
                  and (cast(? as uuid) is null or r.exam_id = cast(? as uuid))
                """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, studentId, examId, examId);
        return count == null ? 0 : count;
    }

    public List<Map<String, Object>> getStudentResultsForAdmin(String studentId, String examId, int size, int offset) {
        String sql = """
                select r.id::text as id,
                       r.exam_id::text as "examId",
                       e.name as "examName",
                       r.student_id::text as "userId",
                       p.username as username,
                       r.score,
                       r.correct_count as correct,
                       r.total_count as total,
                       r.submitted_at as "submittedAt",
                       r.duration_seconds as "durationSeconds"
                from public.results r
                left join public.exams e on e.id = r.exam_id
                left join public.profiles p on p.user_id = r.student_id
                where r.student_id = cast(? as uuid)
                  and (cast(? as uuid) is null or r.exam_id = cast(? as uuid))
                order by r.submitted_at desc
                limit ? offset ?
                """;
        return jdbcTemplate.queryForList(sql, studentId, examId, examId, size, offset);
    }

    public int countStudentResultsForAdmin(String studentId, String examId) {
        String sql = """
                select count(*)
                from public.results r
                where r.student_id = cast(? as uuid)
                  and (cast(? as uuid) is null or r.exam_id = cast(? as uuid))
                """;
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, studentId, examId, examId);
        return count == null ? 0 : count;
    }

    private Map<String, Object> firstOrNull(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }
}
