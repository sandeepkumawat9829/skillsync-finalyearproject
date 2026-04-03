package com.fyp.controller;

import com.fyp.model.dto.LoginRequest;
import com.fyp.model.dto.LoginResponse;
import com.fyp.model.dto.RegisterRequest;
import com.fyp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.cookie.max-age:86400}")
    private long cookieMaxAge; // default 24 hours in seconds

    @Value("${jwt.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Create a new student or mentor account. An OTP will be sent to the email for verification.")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        Map<String, Object> response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP", description = "Verify email address using the OTP sent during registration")
    public ResponseEntity<LoginResponse> verifyEmail(@RequestBody Map<String, String> request,
                                                      HttpServletResponse httpResponse) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (email == null || otp == null) {
            throw new RuntimeException("Email and OTP are required");
        }

        LoginResponse response = authService.verifyEmailAndLogin(email, otp);
        setAuthCookie(httpResponse, response.getToken());
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
    @Operation(summary = "Login", description = "Authenticate user and get JWT token via HttpOnly cookie. Email must be verified first.")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                                HttpServletResponse httpResponse) {
        LoginResponse response = authService.login(request);
        setAuthCookie(httpResponse, response.getToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Clear authentication cookie and end session")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse httpResponse) {
        // Clear the auth cookie by setting max-age to 0
        ResponseCookie clearCookie = ResponseCookie.from("jwtToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if auth service is running")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is running");
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user info from the cookie session")
    public ResponseEntity<LoginResponse> getCurrentUser(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        LoginResponse response = authService.getUserInfoByEmail(email);
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Send a password reset link to the user's email")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        Map<String, Object> response = authService.forgotPassword(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using the token from the email link")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");
        if (token == null || newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Valid token and password (min 6 chars) are required");
        }
        Map<String, Object> response = authService.resetPassword(token, newPassword);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change password for authenticated user (requires current password)")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody Map<String, String> request,
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        LoginResponse userInfo = authService.getUserInfoByEmail(email);
        if (userInfo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Current password and new password (min 6 chars) are required");
        }

        Map<String, Object> response = authService.changePassword(userInfo.getUserId(), currentPassword, newPassword);
        return ResponseEntity.ok(response);
    }

    /**
     * Sets the JWT as an HttpOnly, Secure, SameSite=Strict cookie.
     * This prevents XSS attacks from accessing the token through JavaScript.
     */
    private void setAuthCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("jwtToken", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(cookieMaxAge)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

