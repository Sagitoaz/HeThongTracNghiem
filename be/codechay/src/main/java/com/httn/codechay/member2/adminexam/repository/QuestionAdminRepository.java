package com.httn.codechay.member2.adminexam.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.httn.codechay.member2.adminexam.dto.QuestionUpsertRequest;

@Repository
public class QuestionAdminRepository {
    private final JdbcTemplate jdbcTemplate;

    public QuestionAdminRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsExamById(String examId) {
        String sql = "select count(*) from public.exams where id = cast(? as uuid) and deleted_at is null";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, examId);
        return count != null && count > 0;
    }

    public List<Map<String, Object>> listQuestions(String examId) {
        String sql = """
                select id::text as id,
                       question_text as text,
                       option_a,
                       option_b,
                       option_c,
                       option_d,
                       correct_option_index as "correctOptionIndex",
                       coalesce(explanation, '') as explanation
                from public.questions
                where exam_id = cast(? as uuid)
                  and deleted_at is null
                order by created_at asc
                """;
        List<Map<String, Object>> rawRows = jdbcTemplate.queryForList(sql, examId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : rawRows) {
            result.add(Map.of(
                    "id", row.get("id"),
                    "text", row.get("text"),
                    "options", List.of(
                            row.get("option_a"),
                            row.get("option_b"),
                            row.get("option_c"),
                            row.get("option_d")),
                    "correctOptionIndex", row.get("correctOptionIndex"),
                    "explanation", row.get("explanation")));
        }
        return result;
    }

    public String createQuestion(String examId, QuestionUpsertRequest req) {
        String sql = """
                insert into public.questions(exam_id, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation)
                values(cast(? as uuid), ?, ?, ?, ?, ?, ?, ?)
                returning id::text
                """;

        return jdbcTemplate.queryForObject(sql, String.class,
                examId,
                req.getText(),
                req.getOptions().get(0),
                req.getOptions().get(1),
                req.getOptions().get(2),
                req.getOptions().get(3),
                req.getCorrectOptionIndex(),
                req.getExplanation());
    }

    public int updateQuestion(String examId, String questionId, QuestionUpsertRequest req) {
        String sql = """
                update public.questions
                set question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option_index = ?, explanation = ?, updated_at = now()
                where exam_id = cast(? as uuid)
                  and id = cast(? as uuid)
                  and deleted_at is null
                """;

        return jdbcTemplate.update(sql,
                req.getText(),
                req.getOptions().get(0),
                req.getOptions().get(1),
                req.getOptions().get(2),
                req.getOptions().get(3),
                req.getCorrectOptionIndex(),
                req.getExplanation(),
                examId,
                questionId);
    }

    public Map<String, Object> findQuestionById(String examId, String questionId) {
        String sql = """
                select id::text as id,
                       question_text as text,
                       option_a,
                       option_b,
                       option_c,
                       option_d,
                       correct_option_index as "correctOptionIndex",
                       coalesce(explanation, '') as explanation
                from public.questions
                where exam_id = cast(? as uuid)
                  and id = cast(? as uuid)
                  and deleted_at is null
                """;
        return jdbcTemplate.query(sql, rs -> {
            if (!rs.next()) {
                return null;
            }
            return Map.of(
                    "id", rs.getString("id"),
                    "text", rs.getString("text"),
                    "options", List.of(
                            rs.getString("option_a"),
                            rs.getString("option_b"),
                            rs.getString("option_c"),
                            rs.getString("option_d")),
                    "correctOptionIndex", rs.getInt("correctOptionIndex"),
                    "explanation", rs.getString("explanation"));
        }, examId, questionId);
    }
}
