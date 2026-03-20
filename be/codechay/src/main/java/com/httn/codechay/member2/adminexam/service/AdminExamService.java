package com.httn.codechay.member2.adminexam.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.httn.codechay.common.ApiException;
import com.httn.codechay.member2.adminexam.dto.ExamUpsertRequest;
import com.httn.codechay.member2.adminexam.enums.ExamType;
import com.httn.codechay.member2.adminexam.repository.AdminExamRepository;


@Service
public class AdminExamService {
    private final AdminExamRepository repository;

    public AdminExamService(AdminExamRepository repository) {
        this.repository = repository;
    }
    
    public Map<String, Object> createExam(ExamUpsertRequest req) {
        validateBusinessRules(req);

        String examId = repository.createExam(req);
        Map<String, Object> exam = repository.getExamById(examId);
        if (exam == null) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "500", "Failed to retrieve created exam");
        }
        return exam;
    }

    public Map<String, Object> updateExam(String examId, ExamUpsertRequest req) {
        validateBusinessRules(req);

        int updated = repository.updateExam(examId, req);
        if (updated == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Exam not found");
        }

        Map<String, Object> exam = repository.getExamById(examId);
        if (exam == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Exam not found");
        }
        return exam;
    }

    public void deleteExam(String examId) {
        int deleted = repository.deleteExam(examId);
        if (deleted == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "404", "Exam not found");
        }
    }

    private void validateBusinessRules(ExamUpsertRequest req) {
        if (req.getType() == ExamType.SCHEDULED && req.getStartTime() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "400", "Start time is required for scheduled exams");
        }
    }
}
