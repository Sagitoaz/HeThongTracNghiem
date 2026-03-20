package com.httn.codechay.member3.dto;

import java.time.Instant;

public record StartAttemptResponse(
    String attemptId,
    String examId,
    String studentId,
    Instant startedAt,
    int durationMinutes,
    int remainingSeconds
) {}
