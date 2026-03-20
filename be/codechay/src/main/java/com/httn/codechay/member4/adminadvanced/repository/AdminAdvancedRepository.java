package com.httn.codechay.member4.adminadvanced.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class AdminAdvancedRepository {
    private final JdbcTemplate jdbc;

    public AdminAdvancedRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean isAdminUser(String userId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.profiles WHERE user_id = cast(? as uuid) AND role = cast('admin' as app_role)",
                Integer.class,
                userId
        );
        return count != null && count > 0;
    }

        // API #1: DELETE /admin/exams/{examId}/questions/{questionId}
    public boolean examExists(String examId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.exams WHERE id = cast(? as uuid) AND deleted_at IS NULL",
                Integer.class,
                examId
        );
        return count != null && count > 0;
    }

        public int deleteQuestion(String examId, String questionId, String actorId) {
        return jdbc.update(
            """
            UPDATE public.questions
            SET deleted_at = now(), deleted_by = cast(? as uuid), updated_at = now()
            WHERE exam_id = cast(? as uuid)
              AND id = cast(? as uuid)
              AND deleted_at IS NULL
            """,
            actorId,
            examId,
            questionId
        );
        }

        // API #2: POST /admin/exams/{examId}/questions/import
        public String createImportJob(String examId, String requestedBy, String status) {
        return jdbc.queryForObject(
            """
            INSERT INTO public.import_jobs(exam_id, requested_by, status)
            VALUES (cast(? as uuid), cast(? as uuid), cast(? as job_status))
            RETURNING id::text
            """,
            String.class,
            examId,
            requestedBy,
            status
        );
        }

        public void completeImportJob(String jobId, int importedCount, int failedCount) {
        jdbc.update(
            """
            UPDATE public.import_jobs
            SET status = cast('completed' as job_status), imported_count = ?, failed_count = ?, updated_at = now()
            WHERE id = cast(? as uuid)
            """,
            importedCount,
            failedCount,
            jobId
        );
        }

        public void failImportJob(String jobId) {
        jdbc.update(
            """
            UPDATE public.import_jobs
            SET status = cast('failed' as job_status), updated_at = now()
            WHERE id = cast(? as uuid)
            """,
            jobId
        );
        }

        public void insertImportJobError(String jobId, int rowNumber, String errorMessage) {
        jdbc.update(
            """
            INSERT INTO public.import_job_errors(job_id, row_number, error_message)
            VALUES (cast(? as uuid), ?, ?)
            """,
            jobId,
            rowNumber,
            errorMessage
        );
        }

        public String insertQuestion(
            String examId,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            int correctOptionIndex,
            String explanation
        ) {
        return jdbc.queryForObject(
            """
            INSERT INTO public.questions(
                exam_id, question_text, option_a, option_b, option_c, option_d, correct_option_index, explanation
            )
            VALUES(cast(? as uuid), ?, ?, ?, ?, ?, ?, ?)
            RETURNING id::text
            """,
            String.class,
            examId,
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctOptionIndex,
            explanation
        );
        }

        // API #3: GET /admin/exams/{examId}/results/export
        public List<Map<String, Object>> listExamResults(String examId, LocalDate fromDate, LocalDate toDate) {
        StringBuilder sql = new StringBuilder(
            """
            SELECT r.id::text AS resultid,
                   r.exam_id::text AS examid,
                   e.name AS examname,
                   r.student_id::text AS userid,
                   p.username AS username,
                   r.score AS score,
                   r.correct_count AS correctcount,
                   r.total_count AS totalcount,
                   r.submitted_at AS submittedat,
                   r.duration_seconds AS durationseconds
            FROM public.results r
            JOIN public.exams e ON e.id = r.exam_id
            JOIN public.profiles p ON p.user_id = r.student_id
            WHERE r.exam_id = cast(? as uuid)
            """
        );
        List<Object> params = new ArrayList<>();
        params.add(examId);

        if (fromDate != null) {
            sql.append(" AND r.submitted_at >= cast(? as date)");
            params.add(fromDate);
        }
        if (toDate != null) {
            sql.append(" AND r.submitted_at < (cast(? as date) + interval '1 day')");
            params.add(toDate);
        }

        sql.append(" ORDER BY r.submitted_at DESC");
        return jdbc.queryForList(sql.toString(), params.toArray());
        }

        // API #4: GET /admin/students/{studentId}/results/export
        public boolean studentExists(String studentId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM public.profiles WHERE user_id = cast(? as uuid) AND role = cast('student' as app_role)",
            Integer.class,
            studentId
        );
        return count != null && count > 0;
        }

        public List<Map<String, Object>> listStudentResults(String studentId) {
        return jdbc.queryForList(
            """
            SELECT r.id::text AS resultid,
                   r.exam_id::text AS examid,
                   e.name AS examname,
                   r.student_id::text AS userid,
                   p.username AS username,
                   r.score AS score,
                   r.correct_count AS correctcount,
                   r.total_count AS totalcount,
                   r.submitted_at AS submittedat,
                   r.duration_seconds AS durationseconds
            FROM public.results r
            JOIN public.exams e ON e.id = r.exam_id
            JOIN public.profiles p ON p.user_id = r.student_id
            WHERE r.student_id = cast(? as uuid)
            ORDER BY r.submitted_at DESC
            """,
            studentId
        );
        }

        public String createExportJob(String requestedBy, String scopeType, String scopeId, String format, String status) {
        return jdbc.queryForObject(
            """
            INSERT INTO public.export_jobs(requested_by, scope_type, scope_id, format, status)
            VALUES (cast(? as uuid), ?, cast(? as uuid), cast(? as export_format), cast(? as job_status))
            RETURNING id::text
            """,
            String.class,
            requestedBy,
            scopeType,
            scopeId,
            format,
            status
        );
        }

        public void completeExportJob(String jobId, String outputPath) {
        jdbc.update(
            """
            UPDATE public.export_jobs
            SET status = cast('completed' as job_status), output_path = ?, updated_at = now()
            WHERE id = cast(? as uuid)
            """,
            outputPath,
            jobId
        );
        }

        public void failExportJob(String jobId) {
        jdbc.update(
            """
            UPDATE public.export_jobs
            SET status = cast('failed' as job_status), updated_at = now()
            WHERE id = cast(? as uuid)
            """,
            jobId
        );
        }

        // API #5: GET /admin/statistics/overview
        public Map<String, Object> overviewStats() {
        return Map.of(
            "totalStudents", jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.profiles WHERE role = cast('student' as app_role)", Integer.class
            ),
            "totalExams", jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.exams WHERE deleted_at IS NULL", Integer.class
            ),
            "totalAttempts", jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.attempts", Integer.class
            ),
            "averageScore", jdbc.queryForObject(
                "SELECT COALESCE(AVG(score), 0) FROM public.results", Double.class
            )
        );
        }

        // API #6: GET /admin/statistics/exams/{examId}
        public Map<String, Object> examStats(String examId) {
        return Map.of(
            "examId", examId,
            "attempts", jdbc.queryForObject(
                "SELECT COUNT(*) FROM public.attempts WHERE exam_id = cast(? as uuid)", Integer.class, examId
            ),
            "averageScore", jdbc.queryForObject(
                "SELECT COALESCE(AVG(score), 0) FROM public.results WHERE exam_id = cast(? as uuid)", Double.class, examId
            ),
            "scoreDistribution", List.of(
                jdbc.queryForObject(
                    "SELECT COUNT(*) FROM public.results WHERE exam_id = cast(? as uuid) AND score < 2", Integer.class, examId
                ),
                jdbc.queryForObject(
                    "SELECT COUNT(*) FROM public.results WHERE exam_id = cast(? as uuid) AND score >= 2 AND score < 4", Integer.class, examId
                ),
                jdbc.queryForObject(
                    "SELECT COUNT(*) FROM public.results WHERE exam_id = cast(? as uuid) AND score >= 4 AND score < 6", Integer.class, examId
                ),
                jdbc.queryForObject(
                    "SELECT COUNT(*) FROM public.results WHERE exam_id = cast(? as uuid) AND score >= 6 AND score < 8", Integer.class, examId
                ),
                jdbc.queryForObject(
                    "SELECT COUNT(*) FROM public.results WHERE exam_id = cast(? as uuid) AND score >= 8", Integer.class, examId
                )
            )
        );
        }
}
