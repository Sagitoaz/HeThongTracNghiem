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

    private Map<String, Object> firstOrNull(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }
}
