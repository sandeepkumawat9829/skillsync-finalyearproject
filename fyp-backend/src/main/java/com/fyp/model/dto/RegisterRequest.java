package com.fyp.model.dto;

import com.fyp.model.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    // Full name - optional during registration, filled in profile wizard
    private String fullName;

    // Student-specific fields
    private String enrollmentNumber;
    private String branch;
    private Integer currentSemester;
    private BigDecimal cgpa;
    private List<String> skills;

    // Mentor-specific fields
    private String employeeId;
    private String department;
    private String designation;
    private List<String> specializations;
    private Integer maxProjectsAllowed;

    // Common optional fields
    private String phone;
    private String bio;
}
