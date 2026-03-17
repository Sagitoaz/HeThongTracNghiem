package com.httn.apiservice.common;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuditService {
    private final JdbcTemplate jdbc;

    public AuditService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void log(String actorId, String actorRole, String action, String resourceType, String resourceId, Map<String, Object> metadata) {
        String json = "{}";
        jdbc.update("""
            insert into public.audit_logs(actor_id, actor_role, action, resource_type, resource_id, metadata)
            values (cast(? as uuid), cast(? as app_role), ?, ?, cast(? as uuid), cast(? as jsonb))
            """, actorId, actorRole == null ? "student" : actorRole.toLowerCase(), action, resourceType, resourceId, json);
    }
}
