package com.fyp.controller;

import com.fyp.model.dto.LoginRequest;
import com.fyp.model.dto.LoginResponse;
import com.fyp.model.dto.RegisterRequest;
import com.fyp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new student or mentor account. An OTP will be sent to the email for verification.")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP", description = "Verify email address using the OTP sent during registration")
    public ResponseEntity<LoginResponse> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            throw new RuntimeException("Email and OTP are required");
        }

        LoginResponse response = authService.verifyEmailAndLogin(email, otp);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    @Operation(summary = "Resend OTP", description = "Resend verification OTP to email")
    public ResponseEntity<Map<String, Object>> resendOTP(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null) {
            throw new RuntimeException("Email is required");
        }

        Map<String, Object> response = authService.resendOTP(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and get JWT token. Email must be verified first.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if auth service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }
}
