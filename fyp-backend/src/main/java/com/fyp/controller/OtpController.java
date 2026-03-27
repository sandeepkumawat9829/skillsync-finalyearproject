package com.fyp.controller;

import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
@Tag(name = "OTP", description = "Two-Factor Authentication APIs")
@SecurityRequirement(name = "bearerAuth")
public class OtpController {

    private final OtpService otpService;
    private final UserRepository userRepository;

    @PostMapping("/request")
    @Operation(summary = "Request OTP for a sensitive action")
    public ResponseEntity<Map<String, Object>> requestOtp(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String action = body.get("action");
        if (action == null || action.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Action is required"));
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        otpService.requestOtp(user.getId(), user.getEmail(), action);

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", maskEmail(user.getEmail()),
                "action", action,
                "expiresInMinutes", 10));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP for a sensitive action")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String action = body.get("action");
        String otp = body.get("otp");

        if (action == null || action.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Action is required"));
        }
        if (otp == null || otp.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "OTP is required"));
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isValid = otpService.verifyOtp(user.getId(), action, otp);

        if (isValid) {
            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", "OTP verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "error", "Invalid or expired OTP"));
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Check if OTP is pending for an action")
    public ResponseEntity<Map<String, Object>> checkOtpStatus(
            @RequestParam String action,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isPending = otpService.isOtpPending(user.getId(), action);

        return ResponseEntity.ok(Map.of(
                "action", action,
                "pending", isPending));
    }

    @DeleteMapping("/cancel")
    @Operation(summary = "Cancel a pending OTP")
    public ResponseEntity<Map<String, Object>> cancelOtp(
            @RequestParam String action,
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        otpService.cancelOtp(user.getId(), action);

        return ResponseEntity.ok(Map.of(
                "message", "OTP cancelled successfully",
                "action", action));
    }

    /**
     * Mask email for security (e.g., j***@gmail.com)
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@"))
            return email;

        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];

        if (local.length() <= 2) {
            return local + "***@" + domain;
        }
        return local.charAt(0) + "***@" + domain;
    }
}
