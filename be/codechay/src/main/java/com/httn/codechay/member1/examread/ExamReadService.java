package com.httn.codechay.member1.examread;

import com.httn.codechay.common.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class ExamReadService {
    private static final Logger log = LoggerFactory.getLogger(ExamReadService.class);

    private final ExamReadRepository repository;

    public ExamReadService(ExamReadRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> listExams(String keyword, String type, String status, int page, int size, String sort) {
        validateType(type);
        validateStatus(status);
        if (page < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "page must be >= 0");
        }
        if (size < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "size must be >= 1");
        }

        int boundedSize = Math.min(size, 100);
        String safeSort = sort == null || sort.isBlank() ? "createdAt,desc" : sort;
        List<Map<String, Object>> content = repository.listExams(keyword, type, status, page, boundedSize, safeSort);
        int total = repository.countExams(keyword, type, status);

        log.info("List exams success page={}, size={}, total={}", page, boundedSize, total);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("page", page);
        result.put("size", boundedSize);
        result.put("totalElements", total);
        result.put("totalPages", (int) Math.ceil(total / (double) boundedSize));
        return result;
    }

    public Map<String, Object> examDetail(String examId) {
        validateUuid(examId, "examId");
        Map<String, Object> exam = repository.findExamDetail(examId);
        if (exam == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Exam not found");
        }
        List<Map<String, Object>> questions = repository.findExamQuestions(examId);
        Map<String, Object> result = new LinkedHashMap<>(exam);
        result.put("questions", questions);
        log.info("Exam detail success examId={}, questionCount={}", examId, questions.size());
        return result;
    }

    public Map<String, Object> adminExams(String keyword, String type, String status, int page, int size, String sort) {
        String userId = currentUserId();
        if (userId == null || userId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized");
        }
        String role = repository.findRoleByUserId(userId);
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admin role required");
        }
        return listExams(keyword, type, status, page, size, sort);
    }

    private void validateType(String type) {
        if (type == null || type.isBlank()) {
            return;
        }
        String normalized = type.trim().toLowerCase(Locale.ROOT);
        if (!"free".equals(normalized) && !"scheduled".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "type must be free or scheduled");
        }
    }

    private void validateStatus(String status) {
        if (status == null || status.isBlank()) {
            return;
        }
        String normalized = status.trim().toLowerCase(Locale.ROOT);
        if (!"available".equals(normalized) && !"locked".equals(normalized)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "status must be available or locked");
        }
    }

    private void validateUuid(String value, String fieldName) {
        try {
            UUID.fromString(value);
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", fieldName + " must be a valid UUID");
        }
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }
}

