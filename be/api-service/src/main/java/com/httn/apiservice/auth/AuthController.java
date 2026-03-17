package com.httn.apiservice.auth;

import com.httn.apiservice.dto.LoginRequest;
import com.httn.apiservice.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Object register(@Valid @RequestBody RegisterRequest request) {
        return service.register(request);
    }

    @PostMapping("/login")
    public Object login(@Valid @RequestBody LoginRequest request) {
        return service.login(request, false);
    }

    @PostMapping("/admin/login")
    public Object adminLogin(@Valid @RequestBody LoginRequest request) {
        return service.login(request, true);
    }
}
