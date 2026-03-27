package com.fyp.controller;

import com.fyp.model.dto.ParsedProfileDTO;
import com.fyp.model.entity.MentorProfile;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.repository.MentorProfileRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.UserRepository;
import com.fyp.service.ResumeParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller for profile completion and resume parsing
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileCompletionController {

        private final ResumeParserService resumeParserService;
        private final UserRepository userRepository;
        private final StudentProfileRepository studentProfileRepository;
        private final MentorProfileRepository mentorProfileRepository;

        /**
         * Check if user's profile needs completion
         */
        @GetMapping("/status")
        public ResponseEntity<Map<String, Object>> getProfileStatus(Authentication authentication) {
                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                boolean profileCompleted = user.getProfileCompleted() != null && user.getProfileCompleted();
                boolean hasProfile;
                if (user.getRole() == Role.MENTOR) {
                        hasProfile = mentorProfileRepository.findByUserId(user.getId()).isPresent();
                } else {
                        hasProfile = studentProfileRepository.findByUserId(user.getId()).isPresent();
                }

                return ResponseEntity.ok(Map.of(
                                "profileCompleted", profileCompleted || hasProfile,
                                "userId", user.getId(),
                                "email", user.getEmail(),
                                "role", user.getRole().name()));
        }

        /**
         * Upload and parse resume using Gemini AI
         */
        @PostMapping(value = "/parse-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ParsedProfileDTO> parseResume(
                        @RequestParam("file") MultipartFile file,
                        Authentication authentication) {

                try {
                        // Validate file type
                        String contentType = file.getContentType();
                        if (contentType == null || !contentType.equals("application/pdf")) {
                                return ResponseEntity.badRequest().body(
                                                ParsedProfileDTO.builder()
                                                                .rawText("Error: Only PDF files are supported")
                                                                .confidence(0)
                                                                .build());
                        }

                        // Parse resume
                        ParsedProfileDTO parsed = resumeParserService.parseResume(file);
                        log.info("Resume parsed successfully with confidence: {}", parsed.getConfidence());

                        return ResponseEntity.ok(parsed);

                } catch (Exception e) {
                        log.error("Failed to parse resume: {}", e.getMessage());
                        return ResponseEntity.badRequest().body(
                                        ParsedProfileDTO.builder()
                                                        .rawText("Error: " + e.getMessage())
                                                        .confidence(0)
                                                        .build());
                }
        }

        /**
         * Complete user profile (save profile data) - handles both student and mentor
         */
        @PostMapping("/complete")
        public ResponseEntity<Map<String, Object>> completeProfile(
                        @RequestBody Map<String, Object> request,
                        Authentication authentication) {

                try {
                        String email = authentication.getName();
                        User user = userRepository.findByEmail(email)
                                        .orElseThrow(() -> new RuntimeException("User not found"));

                        Long profileId;

                        if (user.getRole() == Role.MENTOR) {
                                profileId = completeMentorProfileInternal(user, request);
                        } else {
                                profileId = completeStudentProfileInternal(user, request);
                        }

                        // Mark user profile as completed
                        user.setProfileCompleted(true);
                        userRepository.save(user);

                        log.info("Profile completed for user: {} (role: {})", email, user.getRole());

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "message", "Profile completed successfully",
                                        "profileId", profileId));

                } catch (Exception e) {
                        log.error("Failed to complete profile: {}", e.getMessage());
                        return ResponseEntity.badRequest().body(Map.of(
                                        "success", false,
                                        "message", "Failed to complete profile: " + e.getMessage()));
                }
        }

        private Long completeStudentProfileInternal(User user, Map<String, Object> request) {
                StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                                .orElse(StudentProfile.builder().user(user).build());

                profile.setFullName((String) request.get("fullName"));
                profile.setEnrollmentNumber((String) request.get("enrollmentNumber"));
                profile.setBranch((String) request.get("branch"));
                if (request.get("semester") != null) {
                        profile.setCurrentSemester(Integer.valueOf(request.get("semester").toString()));
                }
                if (request.get("cgpa") != null) {
                        profile.setCgpa(new BigDecimal(request.get("cgpa").toString()));
                }
                profile.setPhone((String) request.get("phone"));
                profile.setBio((String) request.get("bio"));
                profile.setGithubUrl((String) request.get("githubUrl"));
                profile.setLinkedinUrl((String) request.get("linkedinUrl"));
                profile.setPortfolioUrl((String) request.get("portfolioUrl"));

                studentProfileRepository.save(profile);
                return profile.getId();
        }

        @SuppressWarnings("unchecked")
        private Long completeMentorProfileInternal(User user, Map<String, Object> request) {
                MentorProfile profile = mentorProfileRepository.findByUserId(user.getId())
                                .orElse(MentorProfile.builder().user(user).build());

                profile.setFullName((String) request.get("fullName"));
                profile.setEmployeeId((String) request.get("employeeId"));
                profile.setDepartment((String) request.get("department"));
                profile.setDesignation((String) request.get("designation"));
                profile.setPhone((String) request.get("phone"));
                profile.setBio((String) request.get("bio"));
                profile.setOfficeLocation((String) request.get("officeLocation"));
                if (request.get("specializations") != null) {
                        Object specValue = request.get("specializations");
                        if (specValue instanceof List) {
                                profile.setSpecializations((List<String>) specValue);
                        } else if (specValue instanceof String) {
                                String specStr = (String) specValue;
                                profile.setSpecializations(
                                        java.util.Arrays.stream(specStr.split(","))
                                                .map(String::trim)
                                                .filter(s -> !s.isEmpty())
                                                .collect(Collectors.toList())
                                );
                        }
                }
                if (request.get("maxProjectsAllowed") != null) {
                        profile.setMaxProjectsAllowed(Integer.valueOf(request.get("maxProjectsAllowed").toString()));
                }

                mentorProfileRepository.save(profile);
                return profile.getId();
        }
}
