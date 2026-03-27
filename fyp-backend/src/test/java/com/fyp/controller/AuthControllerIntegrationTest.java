package com.fyp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fyp.model.dto.LoginRequest;
import com.fyp.model.dto.RegisterRequest;
import com.fyp.model.enums.Role;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private com.fyp.service.EmailService emailService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Register and Login Flow")
    void testRegisterAndLoginFlow() throws Exception {
        // 1. Register
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@integration.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Integration Test User");
        registerRequest.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value(containsString("Registration successful")));

        // 2. Verify Email (Simulate by manually updating user in DB as OTP logic is
        // mocked/complex to integration test without reading emails)
        // In a real integration test we'd intercept the email or peek into the DB for
        // the OTP code.
        // For this scope, we assume the backend logic for verification works (unit
        // tested) and we force verify the user to test login.
        var user = userRepository.findByEmail("test@integration.com").orElseThrow();
        user.setEmailVerified(true);
        userRepository.save(user);

        // 3. Login
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@integration.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("test@integration.com"));
    }

    @Test
    @DisplayName("Login - Should Fail for Unverified User")
    void testLogin_FailUnverified() throws Exception {
        // 1. Register
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("unverified@integration.com");
        registerRequest.setPassword("password123");
        registerRequest.setFullName("Unverified User");
        registerRequest.setRole(Role.STUDENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated());

        // 2. Login (Without verifying)
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("unverified@integration.com");
        loginRequest.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isBadRequest()) // Application returns 400 for unverified login exceptions
                // Adjust expectation based on actual GlobalExceptionHandler
                .andExpect(jsonPath("$.error").exists());
    }
}
