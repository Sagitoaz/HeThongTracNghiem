package com.httn.codechay.member3.service;

import java.sql.Timestamp;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;

import com.httn.codechay.member3.dto.SaveAnswerRequest;
import com.httn.codechay.member3.dto.SaveAnswerResponse;
import com.httn.codechay.member3.dto.StartAttemptResponse;
import com.httn.codechay.member3.repository.AttemptRepository;
import com.httn.codechay.common.ApiException;

@Service
public class AttemptService {
    private final AttemptRepository attemptRepository;

    public AttemptService(AttemptRepository attemptRepository) {
        this.attemptRepository = attemptRepository;
    }

    public StartAttemptResponse startAttempt(String examId, String studentId){
        Map<String, Object> exam = attemptRepository.getExamForStart(examId);
        if (exam == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "EXAM_NOT_FOUND", "Exam not found");
        }

        Map<String, Object> attempt = attemptRepository.createAttempt(examId, studentId);
        if (attempt == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ATTEMPT_CREATE_FAILED", "Failed to create attempt");
        }

        int durationMinutes = ((Number) exam.get("durationMinutes")).intValue();
        Timestamp startedAt = (Timestamp) attempt.get("startedAt");

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
        Map<String, Object> attempt = attemptRepository.getAttemptById(attemptId);
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

        String examId = (String) attempt.get("examId");
        boolean questionExists = attemptRepository.existsQuestionInExam(req.questionId(), examId);
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
                (Timestamp) saved.get("updatedAt")
        );
    }
}
