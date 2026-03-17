package com.httn.apiservice.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.httn.apiservice.common.ApiException;
import com.httn.apiservice.common.ErrorCode;
import com.httn.apiservice.dto.AuthResponse;
import com.httn.apiservice.dto.LoginRequest;
import com.httn.apiservice.dto.RegisterRequest;
import com.httn.apiservice.dto.UserProfile;
import com.httn.apiservice.repo.AppRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {
    private final WebClient webClient = WebClient.builder().build();
    private final String supabaseUrl;
    private final String anonKey;
    private final AppRepository repo;

    public AuthService(@Value("${app.supabase.url}") String supabaseUrl,
                       @Value("${app.supabase.anon-key:}") String anonKey,
                       AppRepository repo) {
        this.supabaseUrl = supabaseUrl;
        this.anonKey = anonKey;
        this.repo = repo;
    }

    public UserProfile register(RegisterRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "confirmPassword must match password");
        }
        var signUp = webClient.post()
                .uri(supabaseUrl + "/auth/v1/signup")
                .header("apikey", anonKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", req.email(), "password", req.password(), "data", Map.of("username", req.username(), "role", "student")))
                .retrieve()
                .bodyToMono(SupabaseSignUpResponse.class)
                .block();

        if (signUp == null || signUp.user == null || signUp.user.id == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Cannot create user");
        }

        Map<String, Object> p = repo.findProfileByUserId(signUp.user.id);
        if (p == null) {
            return new UserProfile(signUp.user.id, req.username(), req.email(), "STUDENT", Instant.now());
        }
        return new UserProfile((String) p.get("id"), (String) p.get("username"), (String) p.get("email"), (String) p.get("role"), (Instant) p.get("createdAt"));
    }

    public AuthResponse login(LoginRequest req, boolean adminOnly) {
        var token = webClient.post()
                .uri(supabaseUrl + "/auth/v1/token?grant_type=password")
                .header("apikey", anonKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("email", req.usernameOrEmail(), "password", req.password()))
                .retrieve()
                .bodyToMono(SupabaseTokenResponse.class)
                .block();

        if (token == null || token.accessToken == null || token.user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Invalid credentials");
        }

        Map<String, Object> p = repo.findProfileByUserId(token.user.id);
        if (p == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, "Profile not found");
        }
        String role = (String) p.get("role");
        if (adminOnly && !"ADMIN".equalsIgnoreCase(role)) {
            throw new ApiException(HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN, "Admin role required");
        }
        UserProfile profile = new UserProfile((String) p.get("id"), (String) p.get("username"), (String) p.get("email"), role.toUpperCase(), (Instant) p.get("createdAt"));
        return new AuthResponse(token.accessToken, token.tokenType, token.expiresIn, profile);
    }

    static class SupabaseSignUpResponse {
        public User user;
    }

    static class SupabaseTokenResponse {
        @JsonProperty("access_token") public String accessToken;
        @JsonProperty("token_type") public String tokenType;
        @JsonProperty("expires_in") public Integer expiresIn;
        public User user;
    }

    static class User {
        public String id;
        public String email;
    }
}
