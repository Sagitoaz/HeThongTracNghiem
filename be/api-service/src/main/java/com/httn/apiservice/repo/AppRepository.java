package com.httn.apiservice.repo;

import com.httn.apiservice.dto.ExamUpsertRequest;
import com.httn.apiservice.dto.QuestionUpsertRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.Map;

@Repository
public class AppRepository {
    private final JdbcTemplate jdbc;

    public AppRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> findProfileByUserId(String userId) {
        return jdbc.query("select user_id::text as id, username, email, upper(role::text) as role, created_at from public.profiles where user_id = cast(? as uuid)",
                rs -> rs.next() ? Map.of(
                        "id", rs.getString("id"),
                        "username", rs.getString("username"),
                        "email", rs.getString("email"),
                        "role", rs.getString("role"),
                        "createdAt", rs.getTimestamp("created_at").toInstant()) : null,
                userId);
    }

    public List<Map<String, Object>> listExams(String keyword, String type, int page, int size, String sort) {
        String order = buildOrderBy(sort, "created_at desc", Map.of(
                "createdAt", "created_at",
                "name", "name",
                "startTime", "start_time"
        ));
        StringBuilder sql = new StringBuilder("""
                select e.id::text as id, e.name, e.type::text as type, e.duration_minutes as \"durationMinutes\", e.start_time as \"startTime\",
                       (select count(*) from public.questions q where q.exam_id=e.id and q.deleted_at is null) as \"questionCount\",
                       case when e.type='free' then true else now() >= e.start_time end as \"isAvailable\"
                from public.exams e
                where e.deleted_at is null
                """);
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            sql.append(" and e.name ilike '%'||?||'%'");
            params.add(keyword);
        }
        if (type != null && !type.isBlank()) {
            sql.append(" and e.type::text = ?");
            params.add(type);
        }
        sql.append(" order by ").append(order).append(" limit ? offset ?");
        params.add(size);
        params.add(page * size);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    public int countExams(String keyword, String type) {
        StringBuilder sql = new StringBuilder("select count(*) from public.exams where deleted_at is null");
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            sql.append(" and name ilike '%'||?||'%'");
            params.add(keyword);
        }
        if (type != null && !type.isBlank()) {
            sql.append(" and type::text = ?");
            params.add(type);
        }

        return jdbc.queryForObject(sql.toString(), Integer.class, params.toArray());
    }

    public Map<String, Object> examDetail(String examId) {
        return jdbc.query("select id::text as id, name, description, type::text as type, duration_minutes as \"durationMinutes\", start_time as \"startTime\" from public.exams where id=cast(? as uuid) and deleted_at is null",
                rs -> {
                    if (!rs.next()) {
                        return null;
                    }
                    var row = new java.util.LinkedHashMap<String, Object>();
                    row.put("id", rs.getString("id"));
                    row.put("name", rs.getString("name"));
                    row.put("description", rs.getString("description") == null ? "" : rs.getString("description"));
                    row.put("type", rs.getString("type"));
                    row.put("durationMinutes", rs.getInt("durationMinutes"));
                    row.put("startTime", rs.getTimestamp("startTime") == null ? null : rs.getTimestamp("startTime").toInstant());
                    return row;
                },
                examId);
    }

    public List<Map<String, Object>> examQuestions(String examId, boolean includeAnswer) {
        String sql = includeAnswer
                ? "select id::text as id, question_text as text, option_a, option_b, option_c, option_d, correct_option_index as \"correctOptionIndex\", coalesce(explanation,'') as explanation from public.questions where exam_id=cast(? as uuid) and deleted_at is null"
                : "select id::text as id, question_text as text, option_a, option_b, option_c, option_d from public.questions where exam_id=cast(? as uuid) and deleted_at is null";
        return jdbc.query(sql, rs -> {
            var list = new java.util.ArrayList<Map<String, Object>>();
            while (rs.next()) {
                var row = new java.util.HashMap<String, Object>();
                row.put("id", rs.getString("id"));
                row.put("text", rs.getString("text"));
                row.put("options", List.of(rs.getString("option_a"), rs.getString("option_b"), rs.getString("option_c"), rs.getString("option_d")));
                if (includeAnswer) {
                    row.put("correctOptionIndex", rs.getInt("correctOptionIndex"));
                    row.put("explanation", rs.getString("explanation"));
                }
                list.add(row);
            }
            return list;
        }, examId);
    }

    public Map<String, Object> startAttempt(String examId, String studentId) {
        String attemptId = jdbc.queryForObject("insert into public.attempts(exam_id, student_id, status) values (cast(? as uuid), cast(? as uuid), 'in_progress') returning id::text", String.class, examId, studentId);
        Integer duration = jdbc.queryForObject("select duration_minutes from public.exams where id=cast(? as uuid)", Integer.class, examId);
        return Map.of("attemptId", attemptId, "examId", examId, "userId", studentId, "startedAt", Instant.now(), "durationMinutes", duration, "remainingSeconds", duration * 60);
    }

    public void saveAnswer(String attemptId, String questionId, int selectedOptionIndex) {
        jdbc.update("""
                insert into public.attempt_answers(attempt_id, question_id, selected_option_index)
                values (cast(? as uuid), cast(? as uuid), ?)
                on conflict (attempt_id, question_id)
                do update set selected_option_index = excluded.selected_option_index, updated_at=now()
                """, attemptId, questionId, selectedOptionIndex);
    }

    public boolean isAttemptSubmitted(String attemptId) {
        Boolean b = jdbc.queryForObject("select status='submitted' from public.attempts where id=cast(? as uuid)", Boolean.class, attemptId);
        return Boolean.TRUE.equals(b);
    }

    public Map<String, Object> submitAttempt(String attemptId) {
        Map<String, Object> info = jdbc.queryForMap("""
                select a.id::text as attempt_id, a.exam_id::text as exam_id, a.student_id::text as student_id,
                       extract(epoch from (now() - a.started_at))::int as duration_seconds
                from public.attempts a where a.id=cast(? as uuid)
                """, attemptId);

        Integer correct = jdbc.queryForObject("""
                select count(*)
                from public.attempt_answers aa
                join public.questions q on q.id = aa.question_id
                where aa.attempt_id = cast(? as uuid)
                  and aa.selected_option_index = q.correct_option_index
                """, Integer.class, attemptId);
        Integer total = jdbc.queryForObject("select count(*) from public.questions where exam_id=cast(? as uuid) and deleted_at is null", Integer.class, info.get("exam_id"));
        if (total == null || total == 0) {
            total = 1;
        }
        double score = Math.round((correct * 10.0 / total) * 100.0) / 100.0;

        jdbc.update("update public.attempts set status='submitted', submitted_at=now(), updated_at=now() where id=cast(? as uuid)", attemptId);
        String resultId = jdbc.queryForObject("""
                insert into public.results(attempt_id, exam_id, student_id, score, correct_count, total_count, submitted_at, duration_seconds)
                values (cast(? as uuid), cast(? as uuid), cast(? as uuid), ?, ?, ?, now(), ?)
                returning id::text
                """, String.class, attemptId, info.get("exam_id"), info.get("student_id"), score, correct, total, info.get("duration_seconds"));

        return Map.of(
                "resultId", resultId,
                "examId", info.get("exam_id"),
                "userId", info.get("student_id"),
                "score", score,
                "correct", correct,
                "total", total,
                "submittedAt", Instant.now(),
                "durationSeconds", info.get("duration_seconds")
        );
    }

    public List<Map<String, Object>> myResults(String userId, String examId, int page, int size, String sort) {
        String order = buildOrderBy(sort, "submitted_at desc", Map.of(
                "submittedAt", "submitted_at",
                "score", "score"
        ));
        return jdbc.queryForList("""
                select r.id::text as id, r.exam_id::text as examId, e.name as examName, r.student_id::text as userId,
                       p.username, r.score, r.correct_count as correct, r.total_count as total,
                       r.submitted_at as submittedAt, r.duration_seconds as durationSeconds
                from public.results r
                join public.exams e on e.id=r.exam_id
                join public.profiles p on p.user_id=r.student_id
                where r.student_id=cast(? as uuid)
                  and (? is null or r.exam_id=cast(? as uuid))
                order by """ + " " + order + " limit ? offset ?", userId, examId, examId, size, page * size);
    }

    public int countMyResults(String userId, String examId) {
        return jdbc.queryForObject("select count(*) from public.results where student_id=cast(? as uuid) and (? is null or exam_id=cast(? as uuid))", Integer.class, userId, examId, examId);
    }

    public List<Map<String, Object>> examResults(String examId, int page, int size, String sort) {
        String order = buildOrderBy(sort, "submitted_at desc", Map.of(
                "submittedAt", "submitted_at",
                "score", "score"
        ));
        return jdbc.queryForList("""
                select r.id::text as id, r.exam_id::text as examId, e.name as examName, r.student_id::text as userId,
                       p.username, r.score, r.correct_count as correct, r.total_count as total,
                       r.submitted_at as submittedAt, r.duration_seconds as durationSeconds
                from public.results r
                join public.exams e on e.id=r.exam_id
                join public.profiles p on p.user_id=r.student_id
                where r.exam_id=cast(? as uuid)
                order by """ + " " + order + " limit ? offset ?", examId, size, page * size);
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

    public Map<String, Object> resultDetail(String resultId) {
        return jdbc.queryForMap("""
                select r.id::text as id, r.exam_id::text as examId, e.name as examName,
                       r.score, r.correct_count as correct, r.total_count as total, r.student_id::text as studentId
                from public.results r join public.exams e on e.id=r.exam_id where r.id=cast(? as uuid)
                """, resultId);
    }

    public List<Map<String, Object>> resultAnswers(String resultId) {
        return jdbc.queryForList("""
                select q.id::text as questionId, aa.selected_option_index as selectedOptionIndex,
                       q.correct_option_index as correctOptionIndex,
                       (aa.selected_option_index = q.correct_option_index) as isCorrect,
                       coalesce(q.explanation,'') as explanation
                from public.results r
                join public.attempt_answers aa on aa.attempt_id = r.attempt_id
                join public.questions q on q.id = aa.question_id
                where r.id = cast(? as uuid)
                """, resultId);
    }

    public String createExam(ExamUpsertRequest req, String actorId) {
        return jdbc.queryForObject("""
                insert into public.exams(name, description, type, duration_minutes, start_time, created_by)
                values (?, ?, cast(? as exam_type), ?, ?, cast(? as uuid)) returning id::text
                """, String.class, req.name(), req.description(), req.type(), req.durationMinutes(), req.startTime(), actorId);
    }

    public void updateExam(String examId, ExamUpsertRequest req) {
        jdbc.update("""
                update public.exams
                set name=?, description=?, type=cast(? as exam_type), duration_minutes=?, start_time=?, updated_at=now()
                where id=cast(? as uuid) and deleted_at is null
                """, req.name(), req.description(), req.type(), req.durationMinutes(), req.startTime(), examId);
    }

    public void deleteExam(String examId, String actorId) {
        jdbc.update("update public.exams set deleted_at=now(), deleted_by=cast(? as uuid), updated_at=now() where id=cast(? as uuid)", actorId, examId);
    }

    public String createQuestion(String examId, QuestionUpsertRequest req) {
        return jdbc.queryForObject("""
                insert into public.questions(exam_id, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation)
                values(cast(? as uuid),?,?,?,?,?,?,?) returning id::text
                """, String.class, examId, req.text(), req.options().get(0), req.options().get(1), req.options().get(2), req.options().get(3), req.correctOptionIndex(), req.explanation());
    }

    public void updateQuestion(String examId, String questionId, QuestionUpsertRequest req) {
        jdbc.update("""
                update public.questions
                set question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option_index=?, explanation=?, updated_at=now()
                where exam_id=cast(? as uuid) and id=cast(? as uuid) and deleted_at is null
                """, req.text(), req.options().get(0), req.options().get(1), req.options().get(2), req.options().get(3), req.correctOptionIndex(), req.explanation(), examId, questionId);
    }

    public void deleteQuestion(String examId, String questionId, String actorId) {
        jdbc.update("update public.questions set deleted_at=now(), deleted_by=cast(? as uuid), updated_at=now() where exam_id=cast(? as uuid) and id=cast(? as uuid)", actorId, examId, questionId);
    }

    public Map<String, Object> overviewStats() {
        return Map.of(
                "totalStudents", jdbc.queryForObject("select count(*) from public.profiles where role='student'", Integer.class),
                "totalExams", jdbc.queryForObject("select count(*) from public.exams where deleted_at is null", Integer.class),
                "totalAttempts", jdbc.queryForObject("select count(*) from public.attempts", Integer.class),
                "averageScore", jdbc.queryForObject("select coalesce(avg(score),0) from public.results", Double.class)
        );
    }

    public Map<String, Object> examStats(String examId) {
        return Map.of(
                "examId", examId,
                "attempts", jdbc.queryForObject("select count(*) from public.attempts where exam_id=cast(? as uuid)", Integer.class, examId),
                "averageScore", jdbc.queryForObject("select coalesce(avg(score),0) from public.results where exam_id=cast(? as uuid)", Double.class, examId),
                "scoreDistribution", List.of(
                        jdbc.queryForObject("select count(*) from public.results where exam_id=cast(? as uuid) and score < 2", Integer.class, examId),
                        jdbc.queryForObject("select count(*) from public.results where exam_id=cast(? as uuid) and score >=2 and score <4", Integer.class, examId),
                        jdbc.queryForObject("select count(*) from public.results where exam_id=cast(? as uuid) and score >=4 and score <6", Integer.class, examId),
                        jdbc.queryForObject("select count(*) from public.results where exam_id=cast(? as uuid) and score >=6 and score <8", Integer.class, examId),
                        jdbc.queryForObject("select count(*) from public.results where exam_id=cast(? as uuid) and score >=8", Integer.class, examId)
                )
        );
    }
}
