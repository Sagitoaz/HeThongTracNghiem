package com.httn.codechay.member4.adminadvanced.controller;

import com.httn.codechay.member4.adminadvanced.service.AdminAdvancedService;
import com.httn.codechay.member4.adminadvanced.service.AdminAdvancedService.ExportPayload;
import com.httn.codechay.security.CurrentUser;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminAdvancedController {
    private final AdminAdvancedService service;

    public AdminAdvancedController(AdminAdvancedService service) {
        this.service = service;
    }

    @DeleteMapping("/exams/{examId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable String examId,
            @PathVariable String questionId
    ) {
        String userId = CurrentUser.userId();
        service.deleteQuestion(examId, questionId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/exams/{examId}/questions/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> importQuestions(@PathVariable String examId, @RequestPart("file") MultipartFile file) {
        String userId = CurrentUser.userId();
        return service.importQuestions(examId, file, userId);
    }

    @GetMapping("/exams/{examId}/results/export")
    public ResponseEntity<ByteArrayResource> exportExamResults(
            @PathVariable String examId,
            @RequestParam String format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        String userId = CurrentUser.userId();
        ExportPayload payload = service.exportExamResults(examId, format, fromDate, toDate, userId);
        return toFileResponse(payload);
    }

    @GetMapping("/students/{studentId}/results/export")
    public ResponseEntity<ByteArrayResource> exportStudentResults(
            @PathVariable String studentId,
            @RequestParam String format
    ) {
        String userId = CurrentUser.userId();
        ExportPayload payload = service.exportStudentResults(studentId, format, userId);
        return toFileResponse(payload);
    }

    @GetMapping("/statistics/overview")
    public Map<String, Object> overviewStats() {
        String userId = CurrentUser.userId();
        return service.getStatisticsOverview(userId);
    }

    @GetMapping("/statistics/exams/{examId}")
    public Map<String, Object> examStats(@PathVariable String examId) {
        String userId = CurrentUser.userId();
        return service.getExamStatistics(examId, userId);
    }

    private ResponseEntity<ByteArrayResource> toFileResponse(ExportPayload payload) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + payload.fileName())
                .contentType(MediaType.parseMediaType(payload.contentType()))
                .body(new ByteArrayResource(payload.data()));
    }
}
