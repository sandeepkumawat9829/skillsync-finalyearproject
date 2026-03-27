package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.*;
import com.fyp.model.entity.*;
import com.fyp.model.enums.MessageType;
import com.fyp.model.enums.RoomType;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;

    /**
     * Get all chat rooms for a user
     */
    @Transactional(readOnly = true)
    public List<ChatRoomDTO> getUserChatRooms(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByUserId(userId);
        return rooms.stream()
                .map(room -> toRoomDTO(room, userId))
                .collect(Collectors.toList());
    }

    /**
     * Initialize / bootstrap chat rooms for all teams a user belongs to.
     * This is called once per session to seed rooms for existing teams.
     */
    @Transactional
    public List<ChatRoomDTO> initializeRoomsForUser(Long userId) {
        // Find all teams the user belongs to
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        List<ChatRoomDTO> result = new ArrayList<>();
        for (TeamMember membership : memberships) {
            Team team = membership.getTeam();
            ChatRoomDTO room = getOrCreateTeamRoom(team.getId(), userId);
            result.add(room);
        }
        return result;
    }

    /**
     * Get messages for a chat room (returned in ascending time order for display)
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRoomMessages(Long roomId, int page, int size) {
        var messages = chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(roomId, PageRequest.of(page, size));
        List<ChatMessageDTO> result = messages.getContent().stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
        // DESC gives newest first for pagination efficiency; reverse for display (oldest at top)
        java.util.Collections.reverse(result);
        return result;
    }

    /**
     * Send a message to a chat room
     */
    @Transactional
    public ChatMessageDTO sendMessage(Long userId, SendMessageRequest request) {
        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat room not found"));

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Auto-add user as participant if not already (handles late joiners)
        if (!chatParticipantRepository.existsByChatRoomIdAndUserId(request.getRoomId(), userId)) {
            ChatParticipant participant = ChatParticipant.builder()
                    .chatRoom(room)
                    .user(sender)
                    .build();
            chatParticipantRepository.save(participant);
        }

        ChatMessage message = ChatMessage.builder()
                .chatRoom(room)
                .sender(sender)
                .messageText(request.getMessageText())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        return toMessageDTO(saved);
    }

    /**
     * Create or get team chat room
     */
    @Transactional
    public ChatRoomDTO getOrCreateTeamRoom(Long teamId, Long userId) {
        return chatRoomRepository.findByRoomTypeAndTeamId(RoomType.TEAM, teamId)
                .map(room -> toRoomDTO(room, userId))
                .orElseGet(() -> createTeamRoom(teamId, userId));
    }

    private ChatRoomDTO createTeamRoom(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        ChatRoom room = ChatRoom.builder()
                .team(team)
                .roomType(RoomType.TEAM)
                .roomName(team.getTeamName() != null ? team.getTeamName() : "Team Chat")
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(room);

        // Add all team members as participants
        team.getMembers().forEach(member -> {
            ChatParticipant participant = ChatParticipant.builder()
                    .chatRoom(savedRoom)
                    .user(member.getUser())
                    .build();
            chatParticipantRepository.save(participant);
        });

        return toRoomDTO(savedRoom, userId);
    }

    /**
     * Create or get direct message room between two users
     */
    @Transactional
    public ChatRoomDTO getOrCreateDirectRoom(Long userId1, Long userId2) {
        return chatRoomRepository.findDirectRoomBetweenUsers(userId1, userId2)
                .map(room -> toRoomDTO(room, userId1))
                .orElseGet(() -> createDirectRoom(userId1, userId2));
    }

    private ChatRoomDTO createDirectRoom(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String roomName = getUserDisplayName(user2);

        ChatRoom room = ChatRoom.builder()
                .roomType(RoomType.DIRECT)
                .roomName(roomName)
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(room);

        // Add both users as participants
        chatParticipantRepository.save(ChatParticipant.builder()
                .chatRoom(savedRoom)
                .user(user1)
                .build());
        chatParticipantRepository.save(ChatParticipant.builder()
                .chatRoom(savedRoom)
                .user(user2)
                .build());

        return toRoomDTO(savedRoom, userId1);
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(Long roomId, Long userId) {
        chatParticipantRepository.updateLastReadAt(roomId, userId, LocalDateTime.now());
    }

    /**
     * Get unread count for a user across all rooms
     */
    @Transactional(readOnly = true)
    public Long getTotalUnreadCount(Long userId) {
        List<ChatRoom> rooms = chatRoomRepository.findByUserId(userId);
        return rooms.stream()
                .mapToLong(room -> getUnreadCount(room, userId))
                .sum();
    }

    // ==================== Helper Methods ====================

    private ChatRoomDTO toRoomDTO(ChatRoom room, Long userId) {
        List<ChatParticipantDTO> participants = room.getParticipants().stream()
                .map(this::toParticipantDTO)
                .collect(Collectors.toList());

        ChatMessageDTO lastMessage = room.getMessages().isEmpty() ? null
                : toMessageDTO(room.getMessages().get(room.getMessages().size() - 1));

        Long unreadCount = getUnreadCount(room, userId);
        Long projectId = room.getTeam() != null && room.getTeam().getProject() != null
                ? room.getTeam().getProject().getId()
                : null;

        return ChatRoomDTO.builder()
                .roomId(room.getId())
                .roomType(room.getRoomType())
                .roomName(room.getRoomName())
                .teamId(room.getTeam() != null ? room.getTeam().getId() : null)
                .projectId(projectId)
                .participants(participants)
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .createdAt(room.getCreatedAt())
                .build();
    }

    private Long getUnreadCount(ChatRoom room, Long userId) {
        return chatParticipantRepository.findByChatRoomIdAndUserId(room.getId(), userId)
                .map(participant -> {
                    LocalDateTime lastRead = participant.getLastReadAt();
                    if (lastRead == null) {
                        return (long) room.getMessages().size();
                    }
                    return chatMessageRepository.countUnreadMessages(room.getId(), lastRead);
                })
                .orElse(0L);
    }

    private ChatMessageDTO toMessageDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .messageId(message.getId())
                .roomId(message.getChatRoom().getId())
                .userId(message.getSender().getId())
                .userName(getUserDisplayName(message.getSender()))
                .messageText(message.getMessageText())
                .messageType(message.getMessageType())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .createdAt(message.getCreatedAt())
                .isEdited(message.getEditedAt() != null)
                .build();
    }

    private ChatParticipantDTO toParticipantDTO(ChatParticipant participant) {
        User user = participant.getUser();
        return ChatParticipantDTO.builder()
                .participantId(participant.getId())
                .userId(user.getId())
                .userName(getUserDisplayName(user))
                .userRole(user.getRole().name())
                .lastReadAt(participant.getLastReadAt())
                .isOnline(false) // Would need WebSocket presence tracking
                .build();
    }

    private String getUserDisplayName(User user) {
        if (user.getStudentProfile() != null) {
            return user.getStudentProfile().getFullName();
        } else if (user.getMentorProfile() != null) {
            return user.getMentorProfile().getFullName();
        }
        return user.getEmail();
    }
}
