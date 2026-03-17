package com.httn.apiservice.service;

import com.httn.apiservice.common.ApiException;
import com.httn.apiservice.common.AuditService;
import com.httn.apiservice.common.ErrorCode;
import com.httn.apiservice.dto.ExamUpsertRequest;
import com.httn.apiservice.dto.QuestionUpsertRequest;
import com.httn.apiservice.dto.SaveAnswerRequest;
import com.httn.apiservice.repo.AppRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.httn.apiservice.security.CurrentUser;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@Service
public class ApiService {
    private final AppRepository repo;
    private final AuditService audit;

    public ApiService(AppRepository repo, AuditService audit) {
        this.repo = repo;
        this.audit = audit;
    }

    public Map<String, Object> pagedExams(String keyword, String type, int page, int size, String sort) {
        List<Map<String, Object>> content = repo.listExams(keyword, type, page, size, sort);
        int total = repo.countExams(keyword, type);
        return Map.of("content", content, "page", page, "size", size, "totalElements", total, "totalPages", (int) Math.ceil(total / (double) size));
    }

    public Map<String, Object> examDetail(String examId) {
        var exam = repo.examDetail(examId);
        if (exam == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Exam not found");
        }
        var questions = repo.examQuestions(examId, false);
        Map<String, Object> result = new LinkedHashMap<>(exam);
        result.put("questions", questions);
        return result;
    }

    public Map<String, Object> startAttempt(String examId) {
        String uid = CurrentUser.userId();
        if (uid == null) throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Unauthorized");
        Map<String, Object> exam = repo.examDetail(examId);
        if (exam == null) throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, "Exam not found");

        if ("scheduled".equalsIgnoreCase((String) exam.get("type"))) {
            Instant startTime = (Instant) exam.get("startTime");
            if (startTime != null && Instant.now().isBefore(startTime)) {
                throw new ApiException(HttpStatus.CONFLICT, ErrorCode.BUSINESS_CONFLICT, "Scheduled exam is not available yet");
            }
        }

        Map<String, Object> out = repo.startAttempt(examId, uid);
        audit.log(uid, CurrentUser.isAdmin() ? "admin" : "student", "START_ATTEMPT", "attempt", (String) out.get("attemptId"), Map.of());
        return out;
    }

    public Map<String, Object> saveAnswer(String attemptId, SaveAnswerRequest req) {
        if (repo.isAttemptSubmitted(attemptId)) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.BUSINESS_CONFLICT, "Attempt already submitted");
        }
        repo.saveAnswer(attemptId, req.questionId(), req.selectedOptionIndex());
        return Map.of("attemptId", attemptId, "saved", true, "updatedAt", Instant.now());
    }

    public Map<String, Object> submitAttempt(String attemptId) {
        if (repo.isAttemptSubmitted(attemptId)) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.BUSINESS_CONFLICT, "Attempt already submitted");
        }
        Map<String, Object> out = repo.submitAttempt(attemptId);
        audit.log(CurrentUser.userId(), CurrentUser.isAdmin() ? "admin" : "student", "SUBMIT_ATTEMPT", "result", (String) out.get("resultId"), Map.of());
        return out;
    }

    public Map<String, Object> resultDetail(String resultId) {
        var raw = repo.resultDetail(resultId);
        var detail = new LinkedHashMap<>(raw);
        detail.put("answers", repo.resultAnswers(resultId));

        // queryForMap may return key as studentid (lowercase) depending JDBC mapping.
        String owner = raw.get("studentId") != null
                ? String.valueOf(raw.get("studentId"))
                : (raw.get("studentid") != null ? String.valueOf(raw.get("studentid")) : null);
        if (!CurrentUser.isAdmin() && !Objects.equals(owner, CurrentUser.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Cannot access this result");
        }
        detail.remove("studentId");
        detail.remove("studentid");
        return detail;
    }

    public Map<String, Object> myResults(String examId, int page, int size, String sort) {
        String uid = CurrentUser.userId();
        List<Map<String, Object>> content = repo.myResults(uid, examId, page, size, sort);
        int total = repo.countMyResults(uid, examId);
        return Map.of("content", content, "page", page, "size", size, "totalElements", total, "totalPages", (int) Math.ceil(total / (double) size));
    }

    public Map<String, Object> createExam(ExamUpsertRequest req) {
        if ("scheduled".equalsIgnoreCase(req.type()) && req.startTime() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "startTime is required for scheduled exam");
        }
        String id = repo.createExam(req, CurrentUser.userId());
        audit.log(CurrentUser.userId(), "admin", "CREATE_EXAM", "exam", id, Map.of());
        return examDetail(id);
    }

    public Map<String, Object> updateExam(String examId, ExamUpsertRequest req) {
        repo.updateExam(examId, req);
        audit.log(CurrentUser.userId(), "admin", "UPDATE_EXAM", "exam", examId, Map.of());
        return examDetail(examId);
    }

    public void deleteExam(String examId) {
        repo.deleteExam(examId, CurrentUser.userId());
        audit.log(CurrentUser.userId(), "admin", "DELETE_EXAM", "exam", examId, Map.of());
    }

    public List<Map<String, Object>> listQuestions(String examId) {
        return repo.examQuestions(examId, true);
    }

    public Map<String, Object> createQuestion(String examId, QuestionUpsertRequest req) {
        String qid = repo.createQuestion(examId, req);
        audit.log(CurrentUser.userId(), "admin", "CREATE_QUESTION", "question", qid, Map.of());
        return listQuestions(examId).stream().filter(q -> qid.equals(q.get("id"))).findFirst().orElse(Map.of("id", qid));
    }

    public Map<String, Object> updateQuestion(String examId, String questionId, QuestionUpsertRequest req) {
        repo.updateQuestion(examId, questionId, req);
        audit.log(CurrentUser.userId(), "admin", "UPDATE_QUESTION", "question", questionId, Map.of());
        return listQuestions(examId).stream().filter(q -> questionId.equals(q.get("id"))).findFirst().orElse(Map.of("id", questionId));
    }

    public void deleteQuestion(String examId, String questionId) {
        repo.deleteQuestion(examId, questionId, CurrentUser.userId());
        audit.log(CurrentUser.userId(), "admin", "DELETE_QUESTION", "question", questionId, Map.of());
    }

    public Map<String, Object> importQuestions(String examId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "File is required");
        }
        int imported = 0;
        List<Map<String, Object>> errors = new ArrayList<>();
        try (var wb = new XSSFWorkbook(file.getInputStream())) {
            var sheet = wb.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                var row = sheet.getRow(i);
                if (row == null) continue;
                try {
                    var req = new QuestionUpsertRequest(
                            row.getCell(0).getStringCellValue(),
                            List.of(
                                    row.getCell(1).getStringCellValue(),
                                    row.getCell(2).getStringCellValue(),
                                    row.getCell(3).getStringCellValue(),
                                    row.getCell(4).getStringCellValue()),
                            (int) row.getCell(5).getNumericCellValue(),
                            row.getCell(6) == null ? null : row.getCell(6).getStringCellValue());
                    repo.createQuestion(examId, req);
                    imported++;
                } catch (Exception ex) {
                    errors.add(Map.of("row", i + 1, "message", ex.getMessage()));
                }
            }
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Cannot parse XLSX");
        }
        audit.log(CurrentUser.userId(), "admin", "IMPORT_QUESTIONS", "exam", examId, Map.of());
        return Map.of("importedCount", imported, "failedCount", errors.size(), "errors", errors);
    }

    public byte[] exportResultsXlsx(List<Map<String, Object>> rows) {
        try (var wb = new XSSFWorkbook(); var out = new ByteArrayOutputStream()) {
            var sh = wb.createSheet("results");
            var h = sh.createRow(0);
            h.createCell(0).setCellValue("resultId");
            h.createCell(1).setCellValue("examId");
            h.createCell(2).setCellValue("examName");
            h.createCell(3).setCellValue("userId");
            h.createCell(4).setCellValue("username");
            h.createCell(5).setCellValue("score");
            int r = 1;
            for (var row : rows) {
                var rr = sh.createRow(r++);
                rr.createCell(0).setCellValue(String.valueOf(row.get("id")));
                rr.createCell(1).setCellValue(String.valueOf(row.get("examid")));
                rr.createCell(2).setCellValue(String.valueOf(row.get("examname")));
                rr.createCell(3).setCellValue(String.valueOf(row.get("userid")));
                rr.createCell(4).setCellValue(String.valueOf(row.get("username")));
                rr.createCell(5).setCellValue(String.valueOf(row.get("score")));
            }
            wb.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Cannot create xlsx");
        }
    }

    public byte[] exportResultsPdf(List<Map<String, Object>> rows) {
        try (var out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("HTTN Results Export"));
            document.add(new Paragraph(" "));
            for (var row : rows) {
                document.add(new Paragraph(
                        String.format("Result=%s | Exam=%s | User=%s | Score=%s",
                                row.get("id"), row.get("examname"), row.get("username"), row.get("score"))));
            }
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Cannot create pdf");
        }
    }

    public List<Map<String, Object>> examResults(String examId) {
        return repo.examResults(examId, 0, 1000, "submittedAt,desc");
    }

    public Map<String, Object> overviewStats() {
        return repo.overviewStats();
    }

    public Map<String, Object> examStats(String examId) {
        return repo.examStats(examId);
    }

    public Map<String, Object> studentResults(String studentId, String examId, int page, int size, String sort) {
        List<Map<String, Object>> content = repo.myResults(studentId, examId, page, size, sort);
        int total = repo.countMyResults(studentId, examId);
        return Map.of("content", content, "page", page, "size", size, "totalElements", total, "totalPages", (int) Math.ceil(total / (double) size));
    }
}
