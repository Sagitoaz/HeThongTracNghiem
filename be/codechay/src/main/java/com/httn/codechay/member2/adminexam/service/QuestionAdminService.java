package com.httn.codechay.member2.adminexam.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.httn.codechay.common.ApiException;
import com.httn.codechay.member2.adminexam.dto.QuestionUpsertRequest;
import com.httn.codechay.member2.adminexam.repository.QuestionAdminRepository;

@Service
public class QuestionAdminService {
    private final QuestionAdminRepository repository;

    public QuestionAdminService(QuestionAdminRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> listQuestions(String examId) {
        ensureExamExists(examId);
        return repository.listQuestions(examId);
    }

    public Map<String, Object> createQuestion(String examId, QuestionUpsertRequest req) {
        ensureExamExists(examId);
        String questionId = repository.createQuestion(examId, req);
        Map<String, Object> question = repository.findQuestionById(examId, questionId);
        if (question == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "500", "Failed to retrieve created question");
        }
        return question;
    }

    public Map<String, Object> updateQuestion(String examId, String questionId, QuestionUpsertRequest req) {
        ensureExamExists(examId);
        int updated = repository.updateQuestion(examId, questionId, req);
        if (updated == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Question not found");
        }
        Map<String, Object> question = repository.findQuestionById(examId, questionId);
        if (question == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Question not found");
        }
        return question;
    }

    private void ensureExamExists(String examId) {
        if (!repository.existsExamById(examId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Exam not found");
        }
    }
}
