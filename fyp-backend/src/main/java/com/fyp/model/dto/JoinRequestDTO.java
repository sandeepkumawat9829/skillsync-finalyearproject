package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestDTO {
    private Long requestId;
    private Long teamId;
    private String teamName;
    private Long fromUserId;
    private String fromUserName;
    private String fromUserEmail;
    private String message;
    private String status;
    private String createdAt;
}
