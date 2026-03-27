package com.fyp.model.dto;

import com.fyp.model.enums.RoomType;
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
public class ChatRoomDTO {
    private Long roomId;
    private RoomType roomType;
    private String roomName;
    private Long teamId;
    private Long projectId;
    private List<ChatParticipantDTO> participants;
    private ChatMessageDTO lastMessage;
    private Long unreadCount;
    private LocalDateTime createdAt;
}
