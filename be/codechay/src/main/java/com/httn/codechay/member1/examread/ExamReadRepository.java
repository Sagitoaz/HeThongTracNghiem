package com.httn.codechay.member1.examread;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Repository
public class ExamReadRepository {
    private final JdbcTemplate jdbcTemplate;

    public ExamReadRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Map<String, Object>> listExams(String keyword, String type, String status, int page, int size, String sort) {
        String orderBy = buildOrderBy(sort, "e.created_at desc", Map.of(
                "createdAt", "e.created_at",
                "name", "e.name",
                "startTime", "e.start_time"
        ));

        StringBuilder sql = new StringBuilder("""
                select e.id::text as id,
                       e.name,
                       e.type::text as type,
                       e.duration_minutes as "durationMinutes",
                       e.start_time as "startTime",
                       (select count(*) from public.questions q where q.exam_id = e.id and q.deleted_at is null) as "questionCount",
                       case when e.type = 'free' then true else now() >= e.start_time end as "isAvailable"
                from public.exams e
                where e.deleted_at is null
                """);
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, keyword, type, status);
        sql.append(" order by ").append(orderBy).append(" limit ? offset ?");
        params.add(size);
        params.add(page * size);

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    public int countExams(String keyword, String type, String status) {
        StringBuilder sql = new StringBuilder("""
                select count(*)
                from public.exams e
                where e.deleted_at is null
                """);
        List<Object> params = new ArrayList<>();
        appendFilters(sql, params, keyword, type, status);
        Integer count = jdbcTemplate.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count == null ? 0 : count;
    }

    public Map<String, Object> findExamDetail(String examId) {
        String sql = """
                select id::text as id,
                       name,
                       coalesce(description, '') as description,
                       type::text as type,
                       duration_minutes as "durationMinutes",
                       start_time as "startTime"
                from public.exams
                where id = cast(? as uuid)
                  and deleted_at is null
                """;
        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", rs.getString("id"));
            row.put("name", rs.getString("name"));
            row.put("description", rs.getString("description"));
            row.put("type", rs.getString("type"));
            row.put("durationMinutes", rs.getInt("durationMinutes"));
            Timestamp startTime = rs.getTimestamp("startTime");
            row.put("startTime", startTime == null ? null : startTime.toInstant());
            return row;
        }, examId);
    }

    public List<Map<String, Object>> findExamQuestions(String examId) {
        String sql = """
                select id::text as id,
                       question_text as text,
                       option_a,
                       option_b,
                       option_c,
                       option_d
                from public.questions
                where exam_id = cast(? as uuid)
                  and deleted_at is null
                order by created_at asc
                """;
        return jdbcTemplate.query(sql, rs -> {
            List<Map<String, Object>> questions = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", rs.getString("id"));
                item.put("text", rs.getString("text"));
                item.put("options", List.of(
                        rs.getString("option_a"),
                        rs.getString("option_b"),
                        rs.getString("option_c"),
                        rs.getString("option_d")
                ));
                questions.add(item);
            }
            return questions;
        }, examId);
    }

    public String findRoleByUserId(String userId) {
        String sql = "select upper(role::text) as role from public.profiles where user_id = cast(? as uuid)";
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("role"), userId);
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }

    private void appendFilters(StringBuilder sql, List<Object> params, String keyword, String type, String status) {
        if (keyword != null && !keyword.isBlank()) {
            sql.append(" and e.name ilike '%' || ? || '%'");
            params.add(keyword.trim());
        }
        if (type != null && !type.isBlank()) {
            sql.append(" and e.type::text = ?");
            params.add(type.trim().toLowerCase(Locale.ROOT));
        }
        if (status != null && !status.isBlank()) {
            String normalizedStatus = status.trim().toLowerCase(Locale.ROOT);
            if ("available".equals(normalizedStatus)) {
                sql.append(" and (e.type = 'free' or now() >= e.start_time)");
            } else if ("locked".equals(normalizedStatus)) {
                sql.append(" and (e.type = 'scheduled' and now() < e.start_time)");
            }
        }
    }

    private String buildOrderBy(String sort, String defaultOrder, Map<String, String> allowedFields) {
        if (sort == null || sort.isBlank()) {
            return defaultOrder;
        }
        String[] parts = sort.split(",");
        String fieldKey = parts[0].trim();
        String directionRaw = parts.length > 1 ? parts[1].trim() : "desc";
        String direction = "asc".equalsIgnoreCase(directionRaw) ? "asc" : "desc";
        String dbField = allowedFields.get(fieldKey);
        if (dbField == null) {
            return defaultOrder;
        }
        return dbField + " " + direction.toUpperCase(Locale.ROOT);
    }
}

