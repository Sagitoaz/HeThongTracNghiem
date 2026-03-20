package com.httn.codechay.member1.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.httn.codechay.common.ApiException;
import com.httn.codechay.member1.auth.dto.AuthResponse;
import com.httn.codechay.member1.auth.dto.LoginRequest;
import com.httn.codechay.member1.auth.dto.RegisterRequest;
import com.httn.codechay.member1.auth.dto.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final WebClient webClient;
    private final AuthRepository repository;
    private final String supabaseUrl;
    private final String anonKey;

    public AuthService(
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.anon-key:}") String anonKey,
            AuthRepository repository
    ) {
        this.webClient = WebClient.builder().build();
        this.repository = repository;
        this.supabaseUrl = supabaseUrl;
        this.anonKey = anonKey;
    }

    @SuppressWarnings("null")
    public UserProfile register(RegisterRequest request) {
        ensureSupabaseConfig();

        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "confirmPassword must match password");
        }

        SupabaseSignUpResponse response;
        try {
            response = webClient.post()
                    .uri(supabaseUrl + "/auth/v1/signup")
                    .header("apikey", anonKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", request.email(),
                            "password", request.password(),
                            "data", Map.of("username", request.username(), "role", "student")
                    ))
                    .retrieve()
                    .bodyToMono(SupabaseSignUpResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            log.warn("Register failed at auth provider with status {}", ex.getStatusCode().value());
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Cannot create user");
        } catch (Exception ex) {
            log.error("Register failed due to upstream error: {}", ex.getClass().getSimpleName());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Auth provider is unavailable");
        }

        if (response == null || response.user == null || response.user.id == null || response.user.id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Cannot create user");
        }

        Map<String, Object> profile = repository.findProfileByUserId(response.user.id);
        if (profile == null) {
            log.info("Register success for userId={}, profile pending sync", response.user.id);
            return new UserProfile(
                    response.user.id,
                    request.username(),
                    request.email(),
                    "STUDENT",
                    Instant.now()
            );
        }

        UserProfile result = toUserProfile(profile);
        log.info("Register success for userId={}", result.id());
        return result;
    }

    public AuthResponse login(LoginRequest request, boolean adminOnly) {
        ensureSupabaseConfig();

        String emailForLogin = resolveEmailForLogin(request.usernameOrEmail());
        SupabaseTokenResponse token;
        try {
            token = webClient.post()
                    .uri(supabaseUrl + "/auth/v1/token?grant_type=password")
                    .header("apikey", anonKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("email", emailForLogin, "password", request.password()))
                    .retrieve()
                    .bodyToMono(SupabaseTokenResponse.class)
                    .block();
        } catch (WebClientResponseException ex) {
            log.warn("Login failed at auth provider with status {}", ex.getStatusCode().value());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials");
        } catch (Exception ex) {
            log.error("Login failed due to upstream error: {}", ex.getClass().getSimpleName());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Auth provider is unavailable");
        }

        if (token == null || token.accessToken == null || token.user == null || token.user.id == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials");
        }

        Map<String, Object> profile = repository.findProfileByUserId(token.user.id);
        if (profile == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Profile not found");
        }

        UserProfile userProfile = toUserProfile(profile);
        if (adminOnly && !"ADMIN".equals(userProfile.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Admin role required");
        }

        log.info("Login success for userId={}, adminOnly={}", userProfile.id(), adminOnly);
        return new AuthResponse(
                token.accessToken,
                token.tokenType == null ? "Bearer" : token.tokenType,
                token.expiresIn == null ? 0 : token.expiresIn,
                userProfile
        );
    }

    private String resolveEmailForLogin(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials");
        }
        String normalized = usernameOrEmail.trim();
        if (normalized.contains("@")) {
            return normalized;
        }
        String email = repository.findEmailByUsername(normalized);
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Invalid credentials");
        }
        return email;
    }

    private UserProfile toUserProfile(Map<String, Object> profile) {
        String id = valueAsString(profile.get("id"));
        String username = valueAsString(profile.get("username"));
        String email = valueAsString(profile.get("email"));
        String role = valueAsString(profile.get("role")).toUpperCase(Locale.ROOT);
        Instant createdAt = profile.get("createdAt") instanceof Instant instant ? instant : Instant.now();
        return new UserProfile(id, username, email, role, createdAt);
    }

    private String valueAsString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private void ensureSupabaseConfig() {
        if (supabaseUrl == null || supabaseUrl.isBlank() || anonKey == null || anonKey.isBlank()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Supabase config is missing");
        }
    }

    static class SupabaseSignUpResponse {
        public SupabaseUser user;
    }

    static class SupabaseTokenResponse {
        @JsonProperty("access_token")
        public String accessToken;
        @JsonProperty("token_type")
        public String tokenType;
        @JsonProperty("expires_in")
        public Integer expiresIn;
        public SupabaseUser user;
    }

    static class SupabaseUser {
        public String id;
        public String email;
    }
}

