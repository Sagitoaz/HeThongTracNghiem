package com.httn.apiservice.dto;

import java.time.Instant;

public record UserProfile(String id, String username, String email, String role, Instant createdAt) {}
