package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorRequestDTO {
    private Long requestId;
    private Long teamId;
    private String teamName;
    private Long projectId;
    private String projectTitle;
    private String projectAbstract;
    private String projectDomain;
    private Long teamLeaderId;
    private String teamLeaderName;
    private List<TeamMemberInfo> teamMembers;
    private String message;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberInfo {
        private Long userId;
        private String name;
        private String role;
    }
}
