package com.fyp.service;

import com.fyp.model.dto.LoginRequest;
import com.fyp.model.dto.LoginResponse;
import com.fyp.model.dto.RegisterRequest;
import com.fyp.model.entity.EmailVerificationToken;
import com.fyp.model.entity.MentorProfile;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.repository.EmailVerificationTokenRepository;
import com.fyp.repository.MentorProfileRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.UserRepository;
import com.fyp.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;

    @Transactional
    public Map<String, Object> register(RegisterRequest request) {
        // Check if email already exists (case-insensitive)
        var existingUser = userRepository.findByEmailIgnoreCase(request.getEmail());
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            // If user exists but email is NOT verified, reuse the record and allow re-registration
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                // Delete old verification tokens for this user
                verificationTokenRepository.deleteByUser(user);
                verificationTokenRepository.flush();
                
                // Update password and role
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setRole(request.getRole());
                user = userRepository.save(user);
                log.info("Reused unverified user to allow re-registration: {}", request.getEmail());
            } else {
                // Email is verified, so it's truly already registered
                throw new RuntimeException("Email is already registered");
            }
        } else {
            // Create user with emailVerified = false and profileCompleted = false
            user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(request.getRole())
                    .isActive(true)
                    .emailVerified(false)
                    .profileCompleted(false) // Profile will be completed in wizard
                    .build();
            user = userRepository.save(user);
        }

        // Generate and send OTP
        String otp = generateAndSaveOTP(user);
        emailService.sendVerificationOTP(user.getEmail(), otp);
        log.info("OTP sent to email: {}", user.getEmail());

        // Return response requiring verification
        return Map.of(
                "message", "Registration successful. Please verify your email.",
                "email", user.getEmail(),
                "requiresVerification", true);
    }

    @Transactional
    public LoginResponse verifyEmailAndLogin(String email, String otpCode) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        EmailVerificationToken token = verificationTokenRepository
                .findByUserAndOtpCodeAndVerifiedFalse(user, otpCode)
                .orElseThrow(() -> new RuntimeException("Invalid OTP code"));

        if (token.isExpired()) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        // Mark token as verified
        token.setVerified(true);
        verificationTokenRepository.save(token);

        // Mark user email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        // Send welcome email
        String fullName = getFullName(user);
        emailService.sendWelcomeEmail(user.getEmail(), fullName);

        // Generate JWT token
        String jwtToken = jwtTokenProvider.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();
    }

    @Transactional
    public Map<String, Object> resendOTP(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Email is already verified");
        }

        // Generate new OTP
        String otp = generateAndSaveOTP(user);
        emailService.sendVerificationOTP(user.getEmail(), otp);
        log.info("OTP resent to email: {}", user.getEmail());

        return Map.of(
                "message", "A new OTP has been sent to your email.",
                "email", user.getEmail());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if email is verified
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new RuntimeException("Please verify your email before logging in. Check your inbox for the OTP.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);
        String fullName = getFullName(user);

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .profileCompleted(Boolean.TRUE.equals(user.getProfileCompleted()))
                .build();
    }

    private String generateAndSaveOTP(User user) {
        // Generate 6-digit OTP
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }

        // Save OTP token
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user)
                .otpCode(otp.toString())
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .build();
        verificationTokenRepository.save(token);

        return otp.toString();
    }

    private String getFullName(User user) {
        if (user.getRole() == Role.STUDENT) {
            return studentProfileRepository.findByUserId(user.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(user.getEmail());
        } else if (user.getRole() == Role.MENTOR) {
            return mentorProfileRepository.findByUserId(user.getId())
                    .map(MentorProfile::getFullName)
                    .orElse(user.getEmail());
        }
        return user.getEmail();
    }
}
