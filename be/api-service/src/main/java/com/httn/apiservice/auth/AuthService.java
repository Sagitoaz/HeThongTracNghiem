package com.httn.apiservice.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthService {
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();
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
        String username = req.username().trim();
        String email = req.email().trim().toLowerCase();

        if (!req.password().equals(req.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "confirmPassword must match password");
        }
        var signUp = callSignUp(username, email, req.password());

        if (signUp == null || signUp.user == null || signUp.user.id == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Cannot create user");
        }

        Map<String, Object> p = repo.findProfileByUserId(signUp.user.id);
        if (p == null) {
            return new UserProfile(signUp.user.id, username, email, "STUDENT", Instant.now());
        }
        return new UserProfile((String) p.get("id"), (String) p.get("username"), (String) p.get("email"), (String) p.get("role"), (Instant) p.get("createdAt"));
    }

    public AuthResponse login(LoginRequest req, boolean adminOnly) {
        var token = callPasswordLogin(req.usernameOrEmail().trim().toLowerCase(), req.password());

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

    private SupabaseSignUpResponse callSignUp(String username, String email, String password) {
        try {
            return webClient.post()
                    .uri(supabaseUrl + "/auth/v1/signup")
                    .header("apikey", anonKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("email", email, "password", password, "data", Map.of("username", username, "role", "student")))
                    .retrieve()
                    .bodyToMono(SupabaseSignUpResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw mapSupabaseException(ex, ErrorCode.VALIDATION_ERROR);
        }
    }

    private SupabaseTokenResponse callPasswordLogin(String email, String password) {
        try {
            return webClient.post()
                    .uri(supabaseUrl + "/auth/v1/token?grant_type=password")
                    .header("apikey", anonKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("email", email, "password", password))
                    .retrieve()
                    .bodyToMono(SupabaseTokenResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            ErrorCode code = ex.getStatusCode().is4xxClientError() ? ErrorCode.UNAUTHORIZED : ErrorCode.INTERNAL_ERROR;
            throw mapSupabaseException(ex, code);
        }
    }

    private ApiException mapSupabaseException(WebClientResponseException ex, ErrorCode fallbackCode) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.BAD_GATEWAY;
        }
        ErrorCode code = status == HttpStatus.TOO_MANY_REQUESTS ? ErrorCode.RATE_LIMIT : fallbackCode;
        String message = extractSupabaseMessage(ex.getResponseBodyAsString());
        if (message == null || message.isBlank()) {
            message = ex.getMessage();
        }
        return new ApiException(status, code, message);
    }

    private String extractSupabaseMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            if (root.hasNonNull("msg")) {
                return root.get("msg").asText();
            }
            if (root.hasNonNull("message")) {
                return root.get("message").asText();
            }
            if (root.hasNonNull("error_description")) {
                return root.get("error_description").asText();
            }
            if (root.hasNonNull("error")) {
                return root.get("error").asText();
            }
        } catch (Exception ignored) {
            return responseBody;
        }
        return responseBody;
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
