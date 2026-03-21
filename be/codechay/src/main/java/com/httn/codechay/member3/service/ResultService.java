package com.httn.codechay.member3.service;

import java.sql.Timestamp;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.httn.codechay.common.ApiException;
import com.httn.codechay.member3.dto.ResultAnswer;
import com.httn.codechay.member3.dto.ResultDetailResponse;
import com.httn.codechay.member3.repository.ResultRepository;

@Service
public class ResultService {
    private final ResultRepository resultRepository;

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    public boolean existsResultByAttemptId(String attemptId) {
        return resultRepository.existsResultByAttemptId(attemptId);
    }

    public Map<String, Object> createResult(
            String attemptId,
            String examId,
            String studentId,
            double score,
            int correctCount,
            int totalCount,
            Timestamp submittedAt,
            int durationSeconds
    ) {
        return resultRepository.createResult(
                attemptId,
                examId,
                studentId,
                score,
                correctCount,
                totalCount,
                submittedAt,
                durationSeconds
        );
    }

    public ResultDetailResponse getResultDetail(String resultId, String currentUserId) {
        Map<String, Object> resultData = resultRepository.getResultByResultId(resultId);
        if (resultData == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "RESULT_NOT_FOUND", "Result not found");
        }

        String ownerId = (String) resultData.get("studentId");
        if (currentUserId != null && !currentUserId.equals(ownerId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You cannot access this result");
        }

        List<Map<String, Object>> answerRows = resultRepository.getResultAnswersByResultId(resultId);
        List<ResultAnswer> answers = answerRows.stream()
                .map(row -> new ResultAnswer(
                        (String) row.get("questionId"),
                        ((Number) row.get("selectedOptionIndex")).intValue(),
                        ((Number) row.get("correctOptionIndex")).intValue(),
                        Boolean.TRUE.equals(row.get("isCorrect")),
                        (String) row.get("explanation")
                ))
                .toList();

        return new ResultDetailResponse(
                (String) resultData.get("id"),
                (String) resultData.get("examId"),
                ((Number) resultData.get("score")).doubleValue(),
                ((Number) resultData.get("correct")).intValue(),
                ((Number) resultData.get("total")).intValue(),
                answers
        );
    }

    public Map<String, Object> getMyResults(String currentUserId, String examId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        int offset = safePage * safeSize;

        List<Map<String, Object>> content = resultRepository.getMyResults(currentUserId, examId, safeSize, offset);
        int totalElements = resultRepository.countMyResults(currentUserId, examId);
        int totalPages = (int) Math.ceil((double) totalElements / safeSize);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", content);
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        return response;
    }

    public Map<String, Object> getStudentResultsForAdmin(String studentId, String examId, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        int offset = safePage * safeSize;

        List<Map<String, Object>> content = resultRepository.getStudentResultsForAdmin(studentId, examId, safeSize, offset);
        int totalElements = resultRepository.countStudentResultsForAdmin(studentId, examId);
        int totalPages = (int) Math.ceil((double) totalElements / safeSize);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", content);
        response.put("page", safePage);
        response.put("size", safeSize);
        response.put("totalElements", totalElements);
        response.put("totalPages", totalPages);
        return response;
    }
}
