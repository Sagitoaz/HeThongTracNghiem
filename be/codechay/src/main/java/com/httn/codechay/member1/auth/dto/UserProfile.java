package com.httn.codechay.member1.auth.dto;

import java.time.Instant;

public record UserProfile(
        String id,
        String username,
        String email,
        String role,
        Instant createdAt
) {}

