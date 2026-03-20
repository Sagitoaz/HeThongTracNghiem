package com.httn.codechay.member1.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AuthRepository {
    private final JdbcTemplate jdbcTemplate;

    public AuthRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> findProfileByUserId(String userId) {
        String sql = """
                select user_id::text as id, username, email, upper(role::text) as role, created_at
                from public.profiles
                where user_id = cast(? as uuid)
                """;
        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }
            Map<String, Object> profile = new LinkedHashMap<>();
            profile.put("id", rs.getString("id"));
            profile.put("username", rs.getString("username"));
            profile.put("email", rs.getString("email"));
            profile.put("role", rs.getString("role"));
            Timestamp createdAt = rs.getTimestamp("created_at");
            profile.put("createdAt", createdAt == null ? Instant.now() : createdAt.toInstant());
            return profile;
        }, userId);
    }

    public String findEmailByUsername(String username) {
        String sql = "select email from public.profiles where username = ?";
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("email"), username);
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }

    public String findRoleByUserId(String userId) {
        String sql = "select upper(role::text) as role from public.profiles where user_id = cast(? as uuid)";
        List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("role"), userId);
        if (rows.isEmpty()) {
            return null;
        }
        return rows.get(0);
    }
}

