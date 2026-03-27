package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInvitationDTO {
    private Long invitationId;
    private Long teamId;
    private String teamName;
    private String projectTitle;
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String message;
    private String status;
    private String createdAt;
    private String respondedAt;
}
