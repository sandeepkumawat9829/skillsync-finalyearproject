package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerReviewDTO {
    private Long reviewId;
    private Long projectId;
    private Long reviewerId;
    private String reviewerName; // Only shown if not anonymous
    private Long revieweeId;
    private String revieweeName;
    private Integer technicalSkillsRating;
    private Integer communicationRating;
    private Integer teamworkRating;
    private Integer problemSolvingRating;
    private Integer overallContributionRating;
    private String anonymousFeedback;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
}
