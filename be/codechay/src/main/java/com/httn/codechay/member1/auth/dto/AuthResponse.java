package com.httn.codechay.member1.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        Integer expiresIn,
        UserProfile user
) {}

