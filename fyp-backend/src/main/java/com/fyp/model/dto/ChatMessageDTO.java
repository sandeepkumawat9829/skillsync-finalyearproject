package com.fyp.model.dto;

import com.fyp.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private Long messageId;
    private Long roomId;
    private Long userId;
    private String userName;
    private String messageText;
    private MessageType messageType;
    private String fileUrl;
    private String fileName;
    private LocalDateTime createdAt;
    private Boolean isEdited;
}
