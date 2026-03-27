package com.fyp.service;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.StudentProfile;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillMatchingService {

    private final StudentProfileRepository studentProfileRepository;
    private final ProjectRepository projectRepository;

    /**
     * Suggest team members based on project required skills
     */
    public List<StudentProfileDTO> suggestTeamMembers(Long projectId, int limit) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<String> requiredTechnologies = project.getTechnologies();
        if (requiredTechnologies == null || requiredTechnologies.isEmpty()) {
            return List.of();
        }

        // Normalize required technologies
        Set<String> normalizedRequired = requiredTechnologies.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .collect(Collectors.toSet());

        // Get all student profiles
        List<StudentProfile> allStudents = studentProfileRepository.findAll();

        // Calculate match scores
        List<Map.Entry<StudentProfile, Double>> scoredStudents = allStudents.stream()
                .filter(sp -> sp.getSkills() != null && !sp.getSkills().isEmpty())
                .map(sp -> {
                    double score = calculateMatchScore(sp.getSkills(), normalizedRequired);
                    return Map.entry(sp, score);
                })
                .filter(entry -> entry.getValue() > 0)
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .collect(Collectors.toList());

        return scoredStudents.stream()
                .map(entry -> toDTO(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * Calculate match score between student skills and required technologies
     */
    private double calculateMatchScore(List<String> skillsList, Set<String> required) {
        Set<String> studentSkills = skillsList.stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (studentSkills.isEmpty())
            return 0;

        // Calculate Jaccard similarity
        Set<String> intersection = new HashSet<>(studentSkills);
        intersection.retainAll(required);

        Set<String> union = new HashSet<>(studentSkills);
        union.addAll(required);

        if (union.isEmpty())
            return 0;
        return (double) intersection.size() / union.size() * 100;
    }

    /**
     * Find projects matching a student's skills
     */
    public List<Project> findMatchingProjects(Long userId, int limit) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (profile.getSkills() == null || profile.getSkills().isEmpty()) {
            return List.of();
        }

        Set<String> studentSkills = profile.getSkills().stream()
                .map(String::toLowerCase)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        List<Project> allProjects = projectRepository.findAll();

        return allProjects.stream()
                .filter(p -> p.getTechnologies() != null && !p.getTechnologies().isEmpty())
                .filter(p -> p.getTeam() == null || !p.getTeam().getIsComplete())
                .map(p -> {
                    Set<String> projectTech = p.getTechnologies().stream()
                            .map(String::toLowerCase)
                            .collect(Collectors.toSet());
                    Set<String> intersection = new HashSet<>(studentSkills);
                    intersection.retainAll(projectTech);
                    return Map.entry(p, intersection.size());
                })
                .filter(entry -> entry.getValue() > 0)
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private StudentProfileDTO toDTO(StudentProfile profile, Double matchScore) {
        return StudentProfileDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .enrollmentNumber(profile.getEnrollmentNumber())
                .branch(profile.getBranch())
                .currentSemester(profile.getCurrentSemester())
                .skills(profile.getSkills())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .matchScore(matchScore)
                .build();
    }
}
