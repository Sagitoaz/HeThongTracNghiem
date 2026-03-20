package com.httn.codechay.member3.service;

import java.sql.Timestamp;
import java.util.Map;

import org.springframework.stereotype.Service;

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
}
