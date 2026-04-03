package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMatchDTO {
    private Long userId; // The ID to use for invitation
    private String email;
    private String fullName;
    private String enrollmentNumber;
    private String branch;
    private BigDecimal cgpa;
    private List<String> skills;
    private String profileImageUrl;
    
    // Suggestion Details
    private Double matchScore; // e.g., 85.5
    private List<String> matchedSkills; // which skills aligned
}
