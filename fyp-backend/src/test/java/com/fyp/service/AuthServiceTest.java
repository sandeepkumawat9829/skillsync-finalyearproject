package com.fyp.service;

import com.fyp.model.dto.LoginRequest;
import com.fyp.model.dto.LoginResponse;
import com.fyp.model.dto.RegisterRequest;
import com.fyp.model.entity.EmailVerificationToken;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.repository.EmailVerificationTokenRepository;
import com.fyp.repository.MentorProfileRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.UserRepository;
import com.fyp.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private MentorProfileRepository mentorProfileRepository;
    @Mock
    private EmailVerificationTokenRepository verificationTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private EmailVerificationToken testToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.STUDENT)
                .isActive(true)
                .emailVerified(false)
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password");
        registerRequest.setRole(Role.STUDENT);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password");

        testToken = EmailVerificationToken.builder()
                .id(1L)
                .user(testUser)
                .otpCode("123456")
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .verified(false)
                .build();
    }

    @Test
    @DisplayName("Register - Should create new user and send OTP")
    void register_ShouldCreateUserAndSendOTP() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(verificationTokenRepository.save(any(EmailVerificationToken.class))).thenReturn(testToken);

        // When
        Map<String, Object> result = authService.register(registerRequest);

        // Then
        assertNotNull(result);
        assertTrue((Boolean) result.get("requiresVerification"));
        verify(emailService, times(1)).sendVerificationOTP(eq("test@example.com"), anyString());
    }

    @Test
    @DisplayName("Register - Should fail if email exists")
    void register_ShouldFailIfEmailExists() {
        // Given
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("Verify Email and Login - Should verify user and return token")
    void verifyEmailAndLogin_ShouldVerifyAndReturnToken() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationTokenRepository.findByUserAndOtpCodeAndVerifiedFalse(any(User.class), eq("123456")))
                .thenReturn(Optional.of(testToken));
        when(jwtTokenProvider.generateToken(anyString())).thenReturn("jwtToken");

        // When
        LoginResponse result = authService.verifyEmailAndLogin("test@example.com", "123456");

        // Then
        assertNotNull(result);
        assertEquals("jwtToken", result.getToken());
        assertTrue(testUser.getEmailVerified());
        assertTrue(testToken.getVerified());
        verify(emailService, times(1)).sendWelcomeEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("Verify Email - Should fail with invalid OTP")
    void verifyEmailAndLogin_ShouldFailWithInvalidOTP() {
        // Given
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationTokenRepository.findByUserAndOtpCodeAndVerifiedFalse(any(User.class), anyString()))
                .thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.verifyEmailAndLogin("test@example.com", "wrongOTP"));
    }

    @Test
    @DisplayName("Login - Should fail if email not verified")
    void login_ShouldFailIfNotVerified() {
        // Given
        testUser.setEmailVerified(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("Login - Should return token if verified")
    void login_ShouldReturnTokenIfVerified() {
        // Given
        testUser.setEmailVerified(true);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtTokenProvider.generateToken(any(Authentication.class))).thenReturn("jwtToken");

        // When
        LoginResponse result = authService.login(loginRequest);

        // Then
        assertNotNull(result);
        assertEquals("jwtToken", result.getToken());
    }

    @Test
    @DisplayName("Resend OTP - Should send new OTP")
    void resendOTP_ShouldSendNewOTP() {
        // Given
        testUser.setEmailVerified(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(verificationTokenRepository.save(any(EmailVerificationToken.class))).thenReturn(testToken);

        // When
        Map<String, Object> result = authService.resendOTP("test@example.com");

        // Then
        assertNotNull(result);
        verify(emailService, times(1)).sendVerificationOTP(eq("test@example.com"), anyString());
    }
}
