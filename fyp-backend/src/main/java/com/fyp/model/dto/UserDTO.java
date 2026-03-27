package com.fyp.model.dto;

import com.fyp.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private boolean enabled;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Student-specific fields
    private String rollNumber;
    private String department;
    private Integer semester;

    // Mentor-specific fields
    private String specialization;
    private Integer maxTeams;
    private Integer currentTeamCount;
}
