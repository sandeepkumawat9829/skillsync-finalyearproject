package com.fyp.service;

import com.fyp.model.dto.AnnouncementDTO;
import com.fyp.model.entity.Announcement;
import com.fyp.model.entity.Announcement.AnnouncementType;
import com.fyp.model.entity.Announcement.TargetAudience;
import com.fyp.model.entity.User;
import com.fyp.repository.AnnouncementRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnnouncementService Tests")
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnnouncementService announcementService;

    private User user;
    private Announcement announcement;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("admin@test.com")
                .build();

        announcement = Announcement.builder()
                .announcementId(1L)
                .postedBy(user)
                .title("Maintenance")
                .content("Server maintenance tonight")
                .announcementType(AnnouncementType.GENERAL)
                .targetAudience(TargetAudience.ALL)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Get Active Announcements - Should return list")
    void getActiveAnnouncements_ShouldReturnList() {
        when(announcementRepository.findActiveAnnouncements(any(LocalDateTime.class), eq(TargetAudience.ALL)))
                .thenReturn(Arrays.asList(announcement));

        List<AnnouncementDTO> result = announcementService.getActiveAnnouncements("ALL");

        assertEquals(1, result.size());
        assertEquals("Maintenance", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Get All Announcements - Should return list")
    void getAllAnnouncements_ShouldReturnList() {
        when(announcementRepository.findByIsActiveTrueOrderByCreatedAtDesc())
                .thenReturn(Arrays.asList(announcement));

        List<AnnouncementDTO> result = announcementService.getAllAnnouncements();

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Important Announcements - Should return list")
    void getImportantAnnouncements_ShouldReturnList() {
        when(announcementRepository.findImportantAnnouncements(any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(announcement));

        List<AnnouncementDTO> result = announcementService.getImportantAnnouncements();

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Announcement - Should return DTO")
    void getAnnouncement_ShouldReturnDTO() {
        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));

        AnnouncementDTO result = announcementService.getAnnouncement(1L);

        assertNotNull(result);
        assertEquals("Maintenance", result.getTitle());
    }

    @Test
    @DisplayName("Create Announcement - Should save and return DTO")
    void createAnnouncement_ShouldSave() {
        AnnouncementDTO dto = AnnouncementDTO.builder()
                .title("Maintenance")
                .content("Server maintenance")
                .announcementType("GENERAL")
                .targetAudience("ALL")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);

        AnnouncementDTO result = announcementService.createAnnouncement(dto, 1L);

        assertNotNull(result);
        assertEquals("Maintenance", result.getTitle());
    }

    @Test
    @DisplayName("Update Announcement - Should update allowed fields")
    void updateAnnouncement_ShouldUpdate() {
        AnnouncementDTO dto = AnnouncementDTO.builder()
                .title("Updated Title")
                .content("Updated Content")
                .announcementType("IMPORTANT")
                .targetAudience("STUDENTS")
                .build();

        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));
        when(announcementRepository.save(any(Announcement.class))).thenAnswer(i -> i.getArgument(0));

        AnnouncementDTO result = announcementService.updateAnnouncement(1L, dto);

        assertEquals("Updated Title", result.getTitle());
        assertEquals("Updated Content", result.getContent());
        assertEquals("IMPORTANT", result.getAnnouncementType());
        assertEquals("STUDENTS", result.getTargetAudience());
    }

    @Test
    @DisplayName("Deactivate Announcement - Should set active to false")
    void deactivateAnnouncement_ShouldDeactivate() {
        when(announcementRepository.findById(1L)).thenReturn(Optional.of(announcement));
        when(announcementRepository.save(any(Announcement.class))).thenAnswer(i -> i.getArgument(0));

        announcementService.deactivateAnnouncement(1L);

        assertFalse(announcement.getIsActive());
        verify(announcementRepository).save(announcement);
    }
}
