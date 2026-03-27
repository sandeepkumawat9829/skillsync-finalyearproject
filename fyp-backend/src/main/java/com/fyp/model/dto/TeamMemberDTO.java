package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberDTO {
    private Long memberId;
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String enrollmentNumber;
    private String branch;
    private Integer contributionScore;
    private String joinedAt;
    private String profileImageUrl;
}
