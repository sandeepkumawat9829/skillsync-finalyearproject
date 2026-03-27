package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeerReviewSummaryDTO {
    private Long userId;
    private String userName;
    private Double averageTechnicalSkills;
    private Double averageCommunication;
    private Double averageTeamwork;
    private Double averageProblemSolving;
    private Double averageOverall;
    private Integer totalReviewsReceived;
}
