package com.httn.codechay.member3.dto;

import java.sql.Timestamp;

public record StartAttemptResponse(
    String attemptId,
    String examId,
    String studentId,
    Timestamp startedAt,
    int durationMinutes,
    int remainingSeconds
) {}
