package com.httn.codechay.member2.adminexam.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.httn.codechay.member2.adminexam.dto.ExamUpsertRequest;

@Repository
public class AdminExamRepository {
    private final JdbcTemplate jdbcTemplate;

    public AdminExamRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String createExam(ExamUpsertRequest req) {
        String sql = """
                insert into public.exams (name, description, type, duration_minutes, start_time)
                values (?, ?, cast(? as exam_type), ?, ?)
                returning id::text
                """;
        return jdbcTemplate.queryForObject(sql, String.class, 
                req.getName(),
                req.getDescription(),
                req.getType().name().toLowerCase(),
                req.getDurationMinutes(),
                req.getStartTime() == null ? null : Timestamp.from(req.getStartTime())
        );
    }

    public int updateExam(String examId, ExamUpsertRequest req) {
        String sql = """
                update public.exams
                set name = ?, description = ?, type = cast(? as exam_type), duration_minutes = ?, start_time = ?, updated_at = now()
                where id = cast(? as uuid) and deleted_at is null
                """;
        return jdbcTemplate.update(sql, 
                req.getName(),
                req.getDescription(),
                req.getType().name().toLowerCase(),
                req.getDurationMinutes(),
                req.getStartTime() == null ? null : Timestamp.from(req.getStartTime()),
                examId
        );
    }

    public int deleteExam(String examId) {
        String sql = """
                update public.exams
                set deleted_at = now(), updated_at = now()
                where id = cast(? as uuid) and deleted_at is null
                """;
        return jdbcTemplate.update(sql, examId);
    }

    public Map<String, Object> getExamById(String examId) {
        String sql = """
                select id::text as id, name, description, type::text as type, duration_minutes as "durationMinutes", start_time as "startTime"
                from public.exams
                where id = cast(? as uuid) and deleted_at is null
                """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, examId);
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }
}
