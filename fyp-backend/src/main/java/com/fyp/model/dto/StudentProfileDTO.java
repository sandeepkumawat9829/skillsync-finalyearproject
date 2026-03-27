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
public class StudentProfileDTO {
    private Long profileId;
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String enrollmentNumber;
    private String branch;
    private Integer currentSemester;
    private BigDecimal cgpa;
    private String phone;
    private String bio;
    private List<String> skills;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profileImageUrl;
    private Boolean hasTeam;
    private String teamName;
    private String projectTitle;
    private Double matchScore; // For skill matching results
}
