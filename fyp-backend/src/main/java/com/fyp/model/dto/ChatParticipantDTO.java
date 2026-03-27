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
public class ChatParticipantDTO {
    private Long participantId;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDateTime lastReadAt;
    private Boolean isOnline;
}
