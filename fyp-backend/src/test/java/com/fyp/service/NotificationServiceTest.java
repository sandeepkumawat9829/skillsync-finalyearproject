package com.fyp.service;

import com.fyp.model.dto.NotificationDTO;
import com.fyp.model.entity.Notification;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.repository.NotificationRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        testNotification = Notification.builder()
                .id(1L)
                .user(testUser)
                .type("TASK_ASSIGNED")
                .title("New Task")
                .message("You have been assigned a new task")
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("Send Notification - Should create notification successfully")
    void sendNotification_ShouldCreateSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        notificationService.sendNotification(1L, "TASK_ASSIGNED", "Title", "Message", "/link");

        // Then
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("TASK_ASSIGNED", saved.getType());
        assertEquals("Title", saved.getTitle());
        assertEquals("Message", saved.getMessage());
        assertFalse(saved.getIsRead());
    }

    @Test
    @DisplayName("Send Notification - Should not save when user not found")
    void sendNotification_ShouldNotSaveWhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        notificationService.sendNotification(999L, "TASK_ASSIGNED", "Message");

        // Then
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Send Notification Overload - Should use type as title")
    void sendNotificationOverload_ShouldUseTypeAsTitle() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        notificationService.sendNotification(1L, "NEW_COMMENT", "New comment on your task");

        // Then
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("NEW_COMMENT", saved.getType());
        assertEquals("NEW_COMMENT", saved.getTitle()); // Title should be same as type in overload
    }

    @Test
    @DisplayName("Get My Notifications - Should return user's notifications")
    void getMyNotifications_ShouldReturnUserNotifications() {
        // Given
        Notification notification2 = Notification.builder()
                .id(2L)
                .user(testUser)
                .type("PROJECT_UPDATE")
                .message("Project updated")
                .isRead(true)
                .build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(Arrays.asList(testNotification, notification2));

        // When
        List<NotificationDTO> result = notificationService.getMyNotifications(1L);

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get Unread Notifications - Should return only unread")
    void getUnreadNotifications_ShouldReturnOnlyUnread() {
        // Given
        when(notificationRepository.findByUserIdAndIsReadFalse(1L))
                .thenReturn(Arrays.asList(testNotification));

        // When
        List<NotificationDTO> result = notificationService.getUnreadNotifications(1L);

        // Then
        assertEquals(1, result.size());
        assertFalse(result.get(0).getIsRead());
    }

    @Test
    @DisplayName("Get Unread Count - Should return count of unread notifications")
    void getUnreadCount_ShouldReturnCorrectCount() {
        // Given
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(5L);

        // When
        long count = notificationService.getUnreadCount(1L);

        // Then
        assertEquals(5, count);
    }

    @Test
    @DisplayName("Mark As Read - Should mark notification as read")
    void markAsRead_ShouldMarkNotificationAsRead() {
        // Given
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(testNotification);

        // When
        notificationService.markAsRead(1L);

        // Then
        assertTrue(testNotification.getIsRead());
        verify(notificationRepository).save(testNotification);
    }

    @Test
    @DisplayName("Mark As Read - Should do nothing when notification not found")
    void markAsRead_ShouldDoNothingWhenNotFound() {
        // Given
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        notificationService.markAsRead(999L);

        // Then
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("Mark All As Read - Should mark all unread notifications as read")
    void markAllAsRead_ShouldMarkAllAsRead() {
        // Given
        Notification notification2 = Notification.builder()
                .id(2L)
                .user(testUser)
                .type("PROJECT_UPDATE")
                .message("Project updated")
                .isRead(false)
                .build();

        when(notificationRepository.findByUserIdAndIsReadFalse(1L))
                .thenReturn(Arrays.asList(testNotification, notification2));

        // When
        notificationService.markAllAsRead(1L);

        // Then
        assertTrue(testNotification.getIsRead());
        assertTrue(notification2.getIsRead());
        verify(notificationRepository).saveAll(anyList());
    }
}
