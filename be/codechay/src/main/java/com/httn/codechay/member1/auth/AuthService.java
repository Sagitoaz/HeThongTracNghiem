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
    private final String serviceRoleKey;

    public AuthService(
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.anon-key:}") String anonKey,
            @Value("${app.supabase.service-role-key:}") String serviceRoleKey,
            AuthRepository repository
    ) {
        this.webClient = WebClient.builder().build();
        this.repository = repository;
        this.supabaseUrl = supabaseUrl;
        this.anonKey = anonKey;
        this.serviceRoleKey = serviceRoleKey;
    }

    @SuppressWarnings("null")
    public UserProfile register(RegisterRequest request) {
        ensureSupabaseConfig();

        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "confirmPassword must match password");
        }

        SupabaseUser createdUser = hasServiceRoleConfig()
                ? registerViaAdminApi(request)
                : registerViaSignUpApi(request);

        if (createdUser == null || createdUser.id == null || createdUser.id.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Cannot create user");
        }

        Map<String, Object> profile = repository.findProfileByUserId(createdUser.id);
        if (profile == null) {
            try {
                repository.upsertProfile(createdUser.id, request.username(), request.email(), "student");
                profile = repository.findProfileByUserId(createdUser.id);
            } catch (Exception ex) {
                log.warn("Profile sync fallback failed for userId={}", createdUser.id);
            }
        }

        if (profile == null) {
            log.info("Register success for userId={}, profile pending sync", createdUser.id);
            return new UserProfile(createdUser.id, request.username(), request.email(), "STUDENT", Instant.now());
        }

        UserProfile result = toUserProfile(profile);
        log.info("Register success for userId={}", result.id());
        return result;
    }

    private boolean hasServiceRoleConfig() {
        return serviceRoleKey != null && !serviceRoleKey.isBlank();
    }

    private SupabaseUser registerViaAdminApi(RegisterRequest request) {
        try {
            SupabaseAdminCreateUserResponse response = webClient.post()
                    .uri(supabaseUrl + "/auth/v1/admin/users")
                    .header("apikey", serviceRoleKey)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", request.email(),
                            "password", request.password(),
                            "email_confirm", true,
                            "user_metadata", Map.of("username", request.username(), "role", "student")
                    ))
                    .retrieve()
                    .bodyToMono(SupabaseAdminCreateUserResponse.class)
                    .block();
            if (response == null) {
                return null;
            }
            if (response.user != null) {
                return response.user;
            }
            SupabaseUser user = new SupabaseUser();
            user.id = response.id;
            user.email = response.email;
            return user;
        } catch (WebClientResponseException ex) {
            throw mapRegisterException(ex);
        } catch (Exception ex) {
            log.error("Register(admin) failed due to upstream error: {}", ex.getClass().getSimpleName());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Auth provider is unavailable");
        }
    }

    private SupabaseUser registerViaSignUpApi(RegisterRequest request) {
        try {
            SupabaseSignUpResponse response = webClient.post()
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
            return response == null ? null : response.user;
        } catch (WebClientResponseException ex) {
            throw mapRegisterException(ex);
        } catch (Exception ex) {
            log.error("Register(signup) failed due to upstream error: {}", ex.getClass().getSimpleName());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Auth provider is unavailable");
        }
    }

    private ApiException mapRegisterException(WebClientResponseException ex) {
        String body = ex.getResponseBodyAsString();
        String safeBody = body == null ? "" : body;
        int status = ex.getStatusCode().value();
        if (status == 429 || safeBody.contains("over_email_send_rate_limit")) {
            log.warn("Register blocked by auth provider rate limit");
            return new ApiException(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMIT", "Email rate limit exceeded. Please retry later.");
        }
        if (safeBody.contains("already")) {
            log.warn("Register failed: email may already exist");
            return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Email already exists");
        }
        log.warn("Register failed at auth provider with status {}", status);
        return new ApiException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Cannot create user");
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

    static class SupabaseAdminCreateUserResponse {
        public String id;
        public String email;
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
