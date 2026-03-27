package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    // Overview stats
    private Integer currentVelocity;
    private Integer sprintProgress;
    private Double completionRate;
    private Integer totalTasksCompleted;
    private Double averageVelocity;
    private String teamEfficiency; // "high", "medium", "low"

    // Burndown data
    private List<BurndownPoint> burndownData;

    // Velocity history
    private List<VelocityPoint> velocityData;

    // Sprint metrics history
    private List<SprintMetric> sprintMetrics;

    // Team contribution
    private List<ContributionData> contributionData;

    // Task distribution by status
    private Map<String, Integer> tasksByStatus;

    // Time metrics
    private TimeMetrics timeMetrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BurndownPoint {
        private LocalDate date;
        private Integer idealRemaining;
        private Integer actualRemaining;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VelocityPoint {
        private String sprintName;
        private Integer committedPoints;
        private Integer completedPoints;
        private Double completionPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SprintMetric {
        private Integer sprintNumber;
        private String sprintName;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer totalTasks;
        private Integer completedTasks;
        private Double completionRate;
        private Integer velocity;
        private Integer committedPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContributionData {
        private String memberName;
        private Integer tasksCompleted;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeMetrics {
        private Double totalHoursLogged;
        private Double averageHoursPerTask;
        private Double hoursThisWeek;
    }
}
