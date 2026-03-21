package com.httn.codechay.member3.dto;

import java.time.Instant;

public record SaveAnswerResponse(
        String attemptId,
        boolean saved,
        Instant updatedAt
) {}
