package com.fyp.model.dto;

import com.fyp.model.enums.SprintStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SprintDTO {
    private Long sprintId;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Integer sprintNumber;

    @NotBlank(message = "Sprint name is required")
    private String sprintName;

    private String sprintGoal;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private SprintStatus status;
    private Integer totalPoints;
    private Integer completedPoints;
    private Integer velocity;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Integer taskCount;
}
