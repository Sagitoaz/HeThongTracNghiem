package com.httn.apiservice.admin;

import com.httn.apiservice.dto.ExamUpsertRequest;
import com.httn.apiservice.dto.QuestionUpsertRequest;
import com.httn.apiservice.service.ApiService;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final ApiService service;

    public AdminController(ApiService service) {
        this.service = service;
    }

    @GetMapping("/exams")
    public Object listExams(@RequestParam(required = false) String keyword,
                            @RequestParam(required = false, name = "type") String type,
                            @RequestParam(defaultValue = "0") int page,
                            @RequestParam(defaultValue = "20") int size,
                            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return service.pagedExams(keyword, type, page, Math.min(size, 100), sort);
    }

    @PostMapping("/exams")
    public Object createExam(@Valid @RequestBody ExamUpsertRequest request) {
        return service.createExam(request);
    }

    @PutMapping("/exams/{examId}")
    public Object updateExam(@PathVariable String examId, @Valid @RequestBody ExamUpsertRequest request) {
        return service.updateExam(examId, request);
    }

    @DeleteMapping("/exams/{examId}")
    public ResponseEntity<Void> deleteExam(@PathVariable String examId) {
        service.deleteExam(examId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exams/{examId}/questions")
    public Object listQuestions(@PathVariable String examId) {
        return service.listQuestions(examId);
    }

    @PostMapping("/exams/{examId}/questions")
    public Object createQuestion(@PathVariable String examId, @Valid @RequestBody QuestionUpsertRequest request) {
        return service.createQuestion(examId, request);
    }

    @PutMapping("/exams/{examId}/questions/{questionId}")
    public Object updateQuestion(@PathVariable String examId, @PathVariable String questionId, @Valid @RequestBody QuestionUpsertRequest request) {
        return service.updateQuestion(examId, questionId, request);
    }

    @DeleteMapping("/exams/{examId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable String examId, @PathVariable String questionId) {
        service.deleteQuestion(examId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/exams/{examId}/questions/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Object importQuestions(@PathVariable String examId, @RequestPart("file") MultipartFile file) {
        return service.importQuestions(examId, file);
    }

    @GetMapping("/exams/{examId}/results/export")
    public ResponseEntity<ByteArrayResource> exportExamResults(@PathVariable String examId,
                                                               @RequestParam String format) {
        var rows = service.examResults(examId);
        if (!"xlsx".equalsIgnoreCase(format) && !"pdf".equalsIgnoreCase(format)) {
            throw new com.httn.apiservice.common.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    com.httn.apiservice.common.ErrorCode.VALIDATION_ERROR, "Unsupported format");
        }
        byte[] data = "pdf".equalsIgnoreCase(format) ? service.exportResultsPdf(rows) : service.exportResultsXlsx(rows);
        String filename = "exam-" + examId + ("pdf".equalsIgnoreCase(format) ? ".pdf" : ".xlsx");
        String contentType = "pdf".equalsIgnoreCase(format) ? MediaType.APPLICATION_PDF_VALUE : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(new ByteArrayResource(data));
    }

    @GetMapping("/students/{studentId}/results")
    public Object studentResults(@PathVariable String studentId,
                                 @RequestParam(required = false) String examId,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size,
                                 @RequestParam(defaultValue = "submittedAt,desc") String sort) {
        return service.studentResults(studentId, examId, page, Math.min(size, 100), sort);
    }

    @GetMapping("/students/{studentId}/results/export")
    public ResponseEntity<ByteArrayResource> exportStudentResults(@PathVariable String studentId,
                                                                  @RequestParam String format) {
        var rows = (java.util.List<java.util.Map<String, Object>>) service.studentResults(studentId, null, 0, 1000, "submittedAt,desc").get("content");
        if (!"xlsx".equalsIgnoreCase(format) && !"pdf".equalsIgnoreCase(format)) {
            throw new com.httn.apiservice.common.ApiException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    com.httn.apiservice.common.ErrorCode.VALIDATION_ERROR, "Unsupported format");
        }
        byte[] data = "pdf".equalsIgnoreCase(format) ? service.exportResultsPdf(rows) : service.exportResultsXlsx(rows);
        String filename = "student-" + studentId + ("pdf".equalsIgnoreCase(format) ? ".pdf" : ".xlsx");
        String contentType = "pdf".equalsIgnoreCase(format) ? MediaType.APPLICATION_PDF_VALUE : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType(contentType))
                .body(new ByteArrayResource(data));
    }

    @GetMapping("/statistics/overview")
    public Object overviewStats() {
        return service.overviewStats();
    }

    @GetMapping("/statistics/exams/{examId}")
    public Object examStats(@PathVariable String examId) {
        return service.examStats(examId);
    }
}
