package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for parsed resume data returned by Gemini AI
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParsedProfileDTO {

    private String fullName;
    private String phone;
    private String branch;
    private Integer semester;
    private BigDecimal cgpa;
    private List<String> skills;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;

    // Resume file URL (stored in Cloudinary)
    private String resumeUrl;

    // Confidence score from AI parsing (0-100)
    private Integer confidence;

    // Raw extracted text for debugging
    private String rawText;
}
