package com.httn.codechay.member3.service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import com.httn.codechay.member3.dto.SaveAnswerRequest;
import com.httn.codechay.member3.dto.SaveAnswerResponse;
import com.httn.codechay.member3.dto.StartAttemptResponse;
import com.httn.codechay.member3.dto.SubmitAttemptResponse;
import com.httn.codechay.member3.repository.AttemptRepository;
import com.httn.codechay.common.ApiException;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttemptService {
    private final AttemptRepository attemptRepository;
    private final ResultService resultService;

    public AttemptService(AttemptRepository attemptRepository, ResultService resultService) {
        this.attemptRepository = attemptRepository;
        this.resultService = resultService;
    }

    public StartAttemptResponse startAttempt(String examId, String studentId){
        Map<String, Object> attempt = attemptRepository.createAttempt(examId, studentId);
        if (attempt == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "EXAM_NOT_FOUND", "Exam not found");
        }

        int durationMinutes = ((Number) attempt.get("durationMinutes")).intValue();
        Instant startedAt = ((Timestamp) attempt.get("startedAt")).toInstant();

        return new StartAttemptResponse(
            (String) attempt.get("id"),
            examId,
            studentId,
            startedAt,
            durationMinutes,
            durationMinutes * 60
        );
    }

    public SaveAnswerResponse saveAnswer(String attemptId, String studentId, SaveAnswerRequest req) {
        Map<String, Object> attempt = attemptRepository.getSaveAnswerContext(attemptId, req.questionId());
        if (attempt == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "ATTEMPT_NOT_FOUND", "Attempt not found");
        }

        String ownerId = (String) attempt.get("studentId");
        if (!Objects.equals(ownerId, studentId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You cannot modify this attempt");
        }

        String status = (String) attempt.get("status");
        if (!"in_progress".equals(status)) {
            throw new ApiException(HttpStatus.CONFLICT, "ATTEMPT_ALREADY_SUBMITTED", "Attempt is already submitted");
        }

        boolean questionExists = Boolean.TRUE.equals(attempt.get("questionExists"));
        if (!questionExists) {
            throw new ApiException(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", "Question not found in this exam");
        }

        Map<String, Object> saved = attemptRepository.saveAnswer(attemptId, req.questionId(), req.selectedOptionIndex());
        if (saved == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "SAVE_ANSWER_FAILED", "Failed to save answer");
        }

        return new SaveAnswerResponse(
                attemptId,
                true,
                ((Timestamp) saved.get("updatedAt")).toInstant()
        );
    }

    @Transactional
    public SubmitAttemptResponse submitAttempt(String attemptId, String studentId) {
        Map<String, Object> attempt = attemptRepository.getAttemptById(attemptId);
        if (attempt == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "ATTEMPT_NOT_FOUND", "Attempt not found");
        }
        String ownerId = (String) attempt.get("studentId");
        if (!Objects.equals(ownerId, studentId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You cannot submit this attempt");
        }
        if (!"in_progress".equals(attempt.get("status"))) {
            throw new ApiException(HttpStatus.CONFLICT, "ATTEMPT_ALREADY_SUBMITTED", "Attempt is already submitted");
        }
        if (resultService.existsResultByAttemptId(attemptId)) {
            throw new ApiException(HttpStatus.CONFLICT, "RESULT_ALREADY_EXISTS", "Result already exists for this attempt");
        }

        List<Map<String, Object>> correctAnswers = attemptRepository.getCorrectAnswersByExamId((String) attempt.get("examId"));
        List<Map<String, Object>> submittedAnswers = attemptRepository.getSubmittedAnswersByAttemptId(attemptId);
        int totalCount = correctAnswers.size();
        if (totalCount <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NO_QUESTIONS_IN_EXAM", "Exam has no questions");
        }
        int correctCount = 0;
        Map<String, Integer> questionIdToCorrectOption = correctAnswers.stream()
                .filter(row -> row.get("questionId") != null && row.get("correctOptionIndex") != null)
                .collect(Collectors.toMap(
                        row -> (String) row.get("questionId"),
                        row -> ((Number) row.get("correctOptionIndex")).intValue()
                ));
        for (Map<String, Object> submitted : submittedAnswers) {
            String questionId = (String) submitted.get("questionId");
            Integer selectedOptionIndex = submitted.get("selectedOptionIndex") == null
                    ? null
                    : ((Number) submitted.get("selectedOptionIndex")).intValue();
            Integer correctOptionIndex = questionIdToCorrectOption.get(questionId);
            if (correctOptionIndex != null && correctOptionIndex.equals(selectedOptionIndex)) {
                correctCount++;
            }
        }
        double score = totalCount == 0 ? 0.0 : (double) correctCount / totalCount * 10.0;
        Timestamp submittedAt = attemptRepository.submitAttempt(attemptId, studentId);
        if (submittedAt == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "SUBMIT_ATTEMPT_FAILED", "Failed to submit attempt");
        }

        Timestamp startedAt = (Timestamp) attempt.get("startedAt");
        int durationSeconds = 0;
        if (startedAt != null) {
            long seconds = submittedAt.toInstant().getEpochSecond() - startedAt.toInstant().getEpochSecond();
            durationSeconds = (int) Math.max(0, seconds);
        }

        Map<String, Object> createdResult = resultService.createResult(
                attemptId,
                (String) attempt.get("examId"),
                studentId,
                score,
                correctCount,
                totalCount,
                submittedAt,
                durationSeconds
        );
        if (createdResult == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "CREATE_RESULT_FAILED", "Failed to create result");
        }

        return new SubmitAttemptResponse(
                (String) createdResult.get("id"),
                (String) attempt.get("examId"),
                studentId,
                score,
                correctCount,
                totalCount,
                submittedAt.toInstant(),
                durationSeconds
        );
    }
    
}
