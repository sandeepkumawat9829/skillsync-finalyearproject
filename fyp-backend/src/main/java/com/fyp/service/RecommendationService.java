package com.fyp.service;

import com.fyp.model.dto.StudentMatchDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.Team;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final TeamRepository teamRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeamMemberRepository teamMemberRepository;

    private static final double WEIGHT_SKILLS = 0.50;
    private static final double WEIGHT_BRANCH = 0.30;
    private static final double WEIGHT_CGPA = 0.20;

    @Transactional(readOnly = true)
    public List<StudentMatchDTO> recommendStudentsForTeam(Long teamId) {
        // 1. Fetch Team and Project
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        Project project = team.getProject();
        
        List<String> projectSkills = project.getTechnologies() != null ? project.getTechnologies() : new ArrayList<>();
        String teamLeaderBranch = "";
        
        // Find team leader's branch for branch alignment
        Optional<StudentProfile> leaderProfileOpt = studentProfileRepository.findByUserId(team.getTeamLeader().getId());
        if (leaderProfileOpt.isPresent()) {
            teamLeaderBranch = leaderProfileOpt.get().getBranch();
        } else {
            // Alternatively use project domain if leader branch is unknown
            teamLeaderBranch = project.getDomain() != null ? project.getDomain() : "";
        }

        // 2. Fetch Unassigned Students
        // Find users who are currently in ANY team
        Set<Long> assignedUserIds = teamMemberRepository.findAll().stream()
                .map(tm -> tm.getUser().getId())
                .collect(Collectors.toSet());

        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        List<StudentProfile> availableStudents = allStudents.stream()
                .filter(s -> !assignedUserIds.contains(s.getUser().getId()))
                // Make sure we don't accidentally recommend the team leader themselves
                .filter(s -> !s.getUser().getId().equals(team.getTeamLeader().getId()))
                .collect(Collectors.toList());

        // 3. Score Each Student
        List<StudentMatchDTO> matches = new ArrayList<>();
        
        for (StudentProfile student : availableStudents) {
            double skillScore = calculateSkillScore(projectSkills, student.getSkills());
            double branchScore = calculateBranchScore(teamLeaderBranch, student.getBranch());
            double cgpaScore = calculateCGPAScore(student.getCgpa());

            double totalScore = (skillScore * WEIGHT_SKILLS) + 
                              (branchScore * WEIGHT_BRANCH) + 
                              (cgpaScore * WEIGHT_CGPA);

            // Get matched skills for UI
            List<String> matchedSkills = getMatchedSkills(projectSkills, student.getSkills());

            matches.add(StudentMatchDTO.builder()
                    .userId(student.getUser().getId())
                    .fullName(student.getFullName())
                    .enrollmentNumber(student.getEnrollmentNumber())
                    .branch(student.getBranch())
                    .cgpa(student.getCgpa())
                    .skills(student.getSkills())
                    .profileImageUrl(student.getProfileImageUrl())
                    .matchScore(Math.round(totalScore * 10.0) / 10.0) // Round to 1 decimal place
                    .matchedSkills(matchedSkills)
                    .build());
        }

        // 4. Sort by Match Score Descending and return top 15
        return matches.stream()
                .sorted(Comparator.comparing(StudentMatchDTO::getMatchScore).reversed())
                .limit(15)
                .collect(Collectors.toList());
    }

    /**
     * Calculates Semantic Skill Score (0 to 100).
     */
    private double calculateSkillScore(List<String> required, List<String> studentSkills) {
        if (required == null || required.isEmpty() || studentSkills == null || studentSkills.isEmpty()) {
            return 0.0;
        }

        int matchCount = 0;
        for (String req : required) {
            if (isSemanticMatch(req, studentSkills)) {
                matchCount++;
            }
        }
        
        // Exact 100% if they have all required skills.
        return ((double) matchCount / required.size()) * 100.0;
    }

    /**
     * Gets exactly which skills matched for UI display.
     */
    private List<String> getMatchedSkills(List<String> required, List<String> studentSkills) {
        List<String> matched = new ArrayList<>();
        if (required == null || studentSkills == null) return matched;

        for (String req : required) {
            if (isSemanticMatch(req, studentSkills)) {
                matched.add(req);
            }
        }
        return matched;
    }

    /**
     * Semantic matcher that handles cases, spaces, and basic common acronyms/synonyms.
     */
    private boolean isSemanticMatch(String requiredSkill, List<String> studentSkills) {
        String reqNorm = normalizeString(requiredSkill);
        
        for (String sSkill : studentSkills) {
            String stuNorm = normalizeString(sSkill);
            // Direct substring match (e.g., "reactjs" contains "react", "machine learning" contains "ml" if mapped)
            if (stuNorm.contains(reqNorm) || reqNorm.contains(stuNorm)) {
                return true;
            }
            // Basic synonym checks
            if (isSynonym(reqNorm, stuNorm)) {
                return true;
            }
        }
        return false;
    }

    private String normalizeString(String input) {
        if (input == null) return "";
        // Lowercase, remove spaces, dashes, dots
        return input.toLowerCase().replaceAll("[\\s\\-\\.]", "");
    }

    private boolean isSynonym(String s1, String s2) {
        Set<String> set = new HashSet<>(Arrays.asList(s1, s2));
        if (set.contains("machinelearning") && set.contains("ml")) return true;
        if (set.contains("react") && set.contains("reactnative")) return true;
        if (set.contains("node") && set.contains("nodejs")) return true;
        if (set.contains("artificialintelligence") && set.contains("ai")) return true;
        if (set.contains("frontend") && set.contains("uiux")) return true;
        if (set.contains("backend") && set.contains("api")) return true;
        return false;
    }

    /**
     * Calculates Branch Alignment Score (0 to 100).
     */
    private double calculateBranchScore(String targetBranch, String studentBranch) {
        if (targetBranch == null || studentBranch == null) return 0.0;
        
        // 100 points for exact match, 50 points if they are loosely related (same faculty, etc)
        // Here we just do exact/substring match for simplicity
        String tNorm = normalizeString(targetBranch);
        String sNorm = normalizeString(studentBranch);
        
        if (tNorm.equals(sNorm)) return 100.0;
        if (tNorm.contains(sNorm) || sNorm.contains(tNorm)) return 80.0;
        
        return 0.0; // Different branch
    }

    /**
     * Calculates CGPA Score relative to 100. (0 to 100).
     */
    private double calculateCGPAScore(BigDecimal cgpa) {
        if (cgpa == null) return 0.0;
        double val = cgpa.doubleValue();
        // Assuming 10-point scale: 10.0 -> 100 points, 8.0 -> 80 points.
        double score = val * 10.0;
        return Math.min(score, 100.0);
    }
}
