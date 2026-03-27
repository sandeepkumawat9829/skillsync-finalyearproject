package com.fyp.model.dto;

import com.fyp.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    private Long roomId;
    private String messageText;
    private MessageType messageType;
    private String fileUrl;
    private String fileName;
}
