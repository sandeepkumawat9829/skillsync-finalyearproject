package com.fyp.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneDTO {
    private Long milestoneId;
    private Long projectId;
    private String projectTitle;
    private String milestoneName;
    private String description;
    private LocalDateTime dueDate;
    private String status;
    private Integer completionPercentage;
    private Boolean reviewedByMentor;
    private String mentorFeedback;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Boolean isOverdue;
}
