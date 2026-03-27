package com.fyp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for generating and verifying OTPs (One-Time Passwords)
 * Used for 2FA on sensitive actions like project submission, mentor requests,
 * etc.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailService emailService;

    // In-memory store for OTPs (userId + action -> OTP data)
    // In production, consider using Redis for distributed systems
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    // OTP validity in minutes
    private static final int OTP_VALIDITY_MINUTES = 10;

    // OTP length
    private static final int OTP_LENGTH = 6;

    /**
     * Generate and send OTP for a specific action
     */
    public void requestOtp(Long userId, String email, String action) {
        String otp = generateOtp();
        String key = generateKey(userId, action);

        // Store OTP with expiry
        otpStore.put(key, new OtpData(otp, LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES)));

        // Send OTP via email
        emailService.sendOtpEmail(email, otp, action);

        log.info("OTP generated for user {} and action {}", userId, action);
    }

    /**
     * Verify OTP for a specific action
     */
    public boolean verifyOtp(Long userId, String action, String providedOtp) {
        String key = generateKey(userId, action);

        OtpData storedData = otpStore.get(key);

        if (storedData == null) {
            log.warn("No OTP found for user {} and action {}", userId, action);
            return false;
        }

        // Check expiry
        if (LocalDateTime.now().isAfter(storedData.expiresAt)) {
            otpStore.remove(key);
            log.warn("OTP expired for user {} and action {}", userId, action);
            return false;
        }

        // Verify OTP
        boolean isValid = storedData.otp.equals(providedOtp);

        if (isValid) {
            // Remove OTP after successful verification (one-time use)
            otpStore.remove(key);
            log.info("OTP verified successfully for user {} and action {}", userId, action);
        } else {
            log.warn("Invalid OTP provided for user {} and action {}", userId, action);
        }

        return isValid;
    }

    /**
     * Check if OTP is pending for a user and action
     */
    public boolean isOtpPending(Long userId, String action) {
        String key = generateKey(userId, action);
        OtpData storedData = otpStore.get(key);

        if (storedData == null) {
            return false;
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(storedData.expiresAt)) {
            otpStore.remove(key);
            return false;
        }

        return true;
    }

    /**
     * Cancel/invalidate a pending OTP
     */
    public void cancelOtp(Long userId, String action) {
        String key = generateKey(userId, action);
        otpStore.remove(key);
        log.info("OTP cancelled for user {} and action {}", userId, action);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();

        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }

        return otp.toString();
    }

    private String generateKey(Long userId, String action) {
        return userId + ":" + action.toUpperCase();
    }

    /**
     * Internal class to store OTP data with expiry
     */
    private static class OtpData {
        final String otp;
        final LocalDateTime expiresAt;

        OtpData(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    /**
     * Valid action types for OTP
     */
    public static class Actions {
        public static final String PROJECT_SUBMIT = "PROJECT_SUBMIT";
        public static final String MENTOR_REQUEST = "MENTOR_REQUEST";
        public static final String TEAM_DELETE = "TEAM_DELETE";
        public static final String PROFILE_UPDATE = "PROFILE_UPDATE";
    }
}
