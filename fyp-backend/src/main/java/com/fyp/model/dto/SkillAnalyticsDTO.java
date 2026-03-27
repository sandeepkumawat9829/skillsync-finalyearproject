package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillAnalyticsDTO {

    // Category -> Average proficiency score (0-100)
    // e.g., {"FRONTEND": 85, "BACKEND": 70, "DATABASE": 60, "DEVOPS": 40, "ML_AI":
    // 55}
    private Map<String, Integer> categoryScores;

    // Individual skill breakdown
    private List<SkillBreakdown> skillBreakdown;

    // Top skills in the team
    private List<String> topSkills;

    // Skills that are missing or weak (below threshold)
    private List<String> missingSkills;

    // Team's overall skill coverage percentage
    private Integer overallCoverage;

    // Total team members analyzed
    private Integer teamMemberCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillBreakdown {
        private String skillName;
        private String category;
        private Integer avgProficiency;
        private Integer membersWithSkill;
    }
}
