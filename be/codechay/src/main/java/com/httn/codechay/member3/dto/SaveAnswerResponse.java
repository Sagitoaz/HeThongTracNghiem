package com.httn.codechay.member3.dto;

import java.sql.Timestamp;

public record SaveAnswerResponse(
        String attemptId,
        boolean saved,
        Timestamp updatedAt
) {}
