package com.fyp.controller;

import com.fyp.model.dto.*;
import com.fyp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final com.fyp.repository.UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Get all chat rooms for the current user
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getChatRooms(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ChatRoomDTO> rooms = chatService.getUserChatRooms(userId);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Get a specific chat room by ID
     */
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<ChatRoomDTO> getChatRoom(
            @PathVariable("roomId") Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ChatRoomDTO> rooms = chatService.getUserChatRooms(userId);
        return rooms.stream()
                .filter(r -> r.getRoomId().equals(roomId))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get messages for a chat room
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            @PathVariable("roomId") Long roomId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "50") int size) {
        List<ChatMessageDTO> messages = chatService.getRoomMessages(roomId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a message to a chat room
     */
    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @PathVariable("roomId") Long roomId,
            @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        request.setRoomId(roomId);
        ChatMessageDTO message = chatService.sendMessage(userId, request);
        // Broadcast to all WebSocket subscribers so others see it in real-time
        messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
        return ResponseEntity.ok(message);
    }

    /**
     * Get or create team chat room
     */
    @GetMapping("/teams/{teamId}/room")
    public ResponseEntity<ChatRoomDTO> getTeamRoom(
            @PathVariable("teamId") Long teamId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ChatRoomDTO room = chatService.getOrCreateTeamRoom(teamId, userId);
        return ResponseEntity.ok(room);
    }

    /**
     * Get or create direct message room with another user
     */
    @GetMapping("/direct/{otherUserId}")
    public ResponseEntity<ChatRoomDTO> getDirectRoom(
            @PathVariable("otherUserId") Long otherUserId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ChatRoomDTO room = chatService.getOrCreateDirectRoom(userId, otherUserId);
        return ResponseEntity.ok(room);
    }

    /**
     * Mark messages in a room as read
     */
    @PostMapping("/rooms/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("roomId") Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        chatService.markAsRead(roomId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get total unread count across all rooms
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        Long count = chatService.getTotalUnreadCount(userId);
        return ResponseEntity.ok(count);
    }

    /**
     * Bootstrap: create chat rooms for all teams the user belongs to that don't have one yet.
     * Called once on chat page load to ensure everyone has a room.
     */
    @PostMapping("/init-rooms")
    public ResponseEntity<List<ChatRoomDTO>> initRooms(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ChatRoomDTO> rooms = chatService.initializeRoomsForUser(userId);
        return ResponseEntity.ok(rooms);
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
