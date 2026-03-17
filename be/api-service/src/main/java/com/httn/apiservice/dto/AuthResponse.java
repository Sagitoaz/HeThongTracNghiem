package com.httn.apiservice.dto;

public record AuthResponse(String accessToken, String tokenType, Integer expiresIn, UserProfile user) {}
