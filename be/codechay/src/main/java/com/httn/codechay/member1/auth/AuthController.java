package com.httn.codechay.member1.auth;

import com.httn.codechay.member1.auth.dto.LoginRequest;
import com.httn.codechay.member1.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Object register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public Object login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request, false);
    }

    @PostMapping("/admin/login")
    public Object adminLogin(@Valid @RequestBody LoginRequest request) {
        return authService.login(request, true);
    }
}

