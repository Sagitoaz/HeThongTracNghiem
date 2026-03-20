package com.httn.codechay.member3.dto;

import java.time.Instant;

public record SubmitAttemptResponse(
        String resultId,
        String examId,
        String userId,
        double score,
        int correct,
        int total,
        Instant submittedAt,
        int durationSeconds
) {}
