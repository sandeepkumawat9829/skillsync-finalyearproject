package com.fyp.controller;

import com.fyp.model.dto.ChatMessageDTO;
import com.fyp.model.dto.SendMessageRequest;
import com.fyp.service.ChatService;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle incoming chat messages via WebSocket
     * Client sends to: /app/chat.send/{roomId}
     * Message is broadcast to: /topic/room/{roomId}
     */
    @MessageMapping("/chat.send/{roomId}")
    public void sendMessage(
            @DestinationVariable Long roomId,
            @Payload SendMessageRequest request,
            Principal principal) {

        Long userId = getUserId(principal);
        request.setRoomId(roomId);

        ChatMessageDTO message = chatService.sendMessage(userId, request);

        // Broadcast to all subscribers of this room
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
    }

    /**
     * Handle typing indicator
     * Client sends to: /app/chat.typing/{roomId}
     */
    @MessageMapping("/chat.typing/{roomId}")
    public void handleTyping(
            @DestinationVariable Long roomId,
            Principal principal) {

        Long userId = getUserId(principal);
        String userName = getUserName(userId);

        // Broadcast typing event to room
        messagingTemplate.convertAndSend(
                "/topic/room/" + roomId + "/typing",
                new TypingEvent(userId, userName, true));
    }

    private Long getUserId(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    private String getUserName(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    if (user.getStudentProfile() != null) {
                        return user.getStudentProfile().getFullName();
                    } else if (user.getMentorProfile() != null) {
                        return user.getMentorProfile().getFullName();
                    }
                    return user.getEmail();
                })
                .orElse("Unknown");
    }

    // Simple record for typing events
    public record TypingEvent(Long userId, String userName, boolean isTyping) {
    }
}
