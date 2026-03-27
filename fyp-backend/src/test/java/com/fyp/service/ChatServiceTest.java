package com.fyp.service;

import com.fyp.model.dto.ChatMessageDTO;
import com.fyp.model.dto.ChatRoomDTO;
import com.fyp.model.dto.SendMessageRequest;
import com.fyp.model.entity.*;
import com.fyp.model.enums.MessageType;
import com.fyp.model.enums.RoomType;
import com.fyp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatService Tests")
class ChatServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatParticipantRepository chatParticipantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TeamRepository teamRepository;

    @InjectMocks
    private ChatService chatService;

    private User testUser;
    private User testUser2;
    private ChatRoom testRoom;
    private Team testTeam;
    private ChatMessage testMessage;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("user1@example.com")
                .build();

        testUser2 = User.builder()
                .id(2L)
                .email("user2@example.com")
                .build();

        testTeam = Team.builder()
                .id(1L)
                .teamName("Test Team")
                .members(new ArrayList<>())
                .build();

        // Add member to team
        TeamMember member = TeamMember.builder().user(testUser).team(testTeam).build();
        testTeam.getMembers().add(member);

        testRoom = ChatRoom.builder()
                .id(1L)
                .roomName("Test Room")
                .roomType(RoomType.TEAM)
                .team(testTeam)
                .messages(new ArrayList<>())
                .participants(new ArrayList<>())
                .build();

        testMessage = ChatMessage.builder()
                .id(1L)
                .chatRoom(testRoom)
                .sender(testUser)
                .messageText("Hello")
                .messageType(MessageType.TEXT)
                .build();
    }

    @Test
    @DisplayName("Get User Chat Rooms - Should return rooms")
    void getUserChatRooms_ShouldReturnRooms() {
        // Given
        when(chatRoomRepository.findByUserId(1L)).thenReturn(Arrays.asList(testRoom));
        when(chatParticipantRepository.findByChatRoomIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        // When
        var result = chatService.getUserChatRooms(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Room", result.get(0).getRoomName());
    }

    @Test
    @DisplayName("Send Message - Should save message when user is participant")
    void sendMessage_ShouldSaveMessage() {
        // Given
        SendMessageRequest request = new SendMessageRequest();
        request.setRoomId(1L);
        request.setMessageText("Hello World");
        request.setMessageType(MessageType.TEXT);

        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chatParticipantRepository.existsByChatRoomIdAndUserId(1L, 1L)).thenReturn(true);
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(testMessage);

        // When
        ChatMessageDTO result = chatService.sendMessage(1L, request);

        // Then
        assertNotNull(result);
        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
    }

    @Test
    @DisplayName("Send Message - Should fail when user not participant")
    void sendMessage_ShouldFailWhenNotParticipant() {
        // Given
        SendMessageRequest request = new SendMessageRequest();
        request.setRoomId(1L);

        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(chatParticipantRepository.existsByChatRoomIdAndUserId(1L, 1L)).thenReturn(false);

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> chatService.sendMessage(1L, request));
    }

    @Test
    @DisplayName("Get Room Messages - Should return paged messages")
    void getRoomMessages_ShouldReturnPagedMessages() {
        // Given
        Page<ChatMessage> page = new PageImpl<>(Arrays.asList(testMessage));
        when(chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(eq(1L), any(Pageable.class)))
                .thenReturn(page);

        // When
        var result = chatService.getRoomMessages(1L, 0, 10);

        // Then
        assertEquals(1, result.size());
        assertEquals("Hello", result.get(0).getMessageText());
    }

    @Test
    @DisplayName("Get or Create Team Room - Should return existing room")
    void getOrCreateTeamRoom_ShouldReturnExisting() {
        // Given
        when(chatRoomRepository.findByRoomTypeAndTeamId(RoomType.TEAM, 1L))
                .thenReturn(Optional.of(testRoom));
        when(chatParticipantRepository.findByChatRoomIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        // When
        ChatRoomDTO result = chatService.getOrCreateTeamRoom(1L, 1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getRoomId());
        verify(chatRoomRepository, never()).save(any(ChatRoom.class));
    }

    @Test
    @DisplayName("Get or Create Team Room - Should create new if not exists")
    void getOrCreateTeamRoom_ShouldCreateNew() {
        // Given
        when(chatRoomRepository.findByRoomTypeAndTeamId(RoomType.TEAM, 1L))
                .thenReturn(Optional.empty());
        when(teamRepository.findById(1L)).thenReturn(Optional.of(testTeam));
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(testRoom);
        when(chatParticipantRepository.findByChatRoomIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

        // When
        ChatRoomDTO result = chatService.getOrCreateTeamRoom(1L, 1L);

        // Then
        assertNotNull(result);
        verify(chatRoomRepository, times(1)).save(any(ChatRoom.class));
        // Should save participants for team members
        verify(chatParticipantRepository, atLeastOnce()).save(any(ChatParticipant.class));
    }

    @Test
    @DisplayName("Mark As Read - Should update participant")
    void markAsRead_ShouldUpdateParticipant() {
        // When
        chatService.markAsRead(1L, 1L);

        // Then
        verify(chatParticipantRepository, times(1)).updateLastReadAt(eq(1L), eq(1L), any());
    }
}
