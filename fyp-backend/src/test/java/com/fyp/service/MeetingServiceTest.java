package com.fyp.service;

import com.fyp.model.dto.MeetingDTO;
import com.fyp.model.entity.Meeting;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.TeamMember;
import com.fyp.model.entity.User;
import com.fyp.repository.MeetingRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MeetingService Tests")
class MeetingServiceTest {

    @Mock
    private MeetingRepository meetingRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MeetingService meetingService;

    private Team team;
    private User mentor;
    private User student;
    private Meeting meeting;
    private MeetingDTO meetingDTO;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@test.com")
                .build();

        mentor = User.builder()
                .id(2L)
                .email("mentor@test.com")
                .build();

        Project project = Project.builder()
                .id(1L)
                .title("Test Project")
                .build();

        TeamMember member = TeamMember.builder()
                .user(student)
                .build();

        team = Team.builder()
                .id(1L)
                .project(project)
                .members(Collections.singletonList(member))
                .build();

        meeting = Meeting.builder()
                .id(1L)
                .title("Sync Meeting")
                .team(team)
                .mentor(mentor)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .durationMinutes(60)
                .status("SCHEDULED")
                .build();

        meetingDTO = MeetingDTO.builder()
                .title("Sync Meeting")
                .teamId(1L)
                .mentorId(2L)
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    @DisplayName("Schedule Meeting - Should save and notify")
    void scheduleMeeting_ShouldSaveAndNotify() {
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mentor));
        when(meetingRepository.save(any(Meeting.class))).thenReturn(meeting);

        MeetingDTO result = meetingService.scheduleMeeting(meetingDTO, 1L);

        assertNotNull(result);
        verify(meetingRepository).save(any(Meeting.class));
        verify(notificationService).sendNotification(eq(1L), eq("MEETING_SCHEDULED"), anyString()); // Student
        verify(notificationService).sendNotification(eq(2L), eq("MEETING_SCHEDULED"), anyString()); // Mentor
    }

    @Test
    @DisplayName("Get Meeting - Should return DTO")
    void getMeeting_ShouldReturnDTO() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        MeetingDTO result = meetingService.getMeeting(1L);

        assertNotNull(result);
        assertEquals("Sync Meeting", result.getTitle());
    }

    @Test
    @DisplayName("Get Meetings By Team - Should return list")
    void getMeetingsByTeam_ShouldReturnList() {
        when(meetingRepository.findByTeamId(1L)).thenReturn(Collections.singletonList(meeting));

        List<MeetingDTO> result = meetingService.getMeetingsByTeam(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Upcoming Meetings - Should return future meetings")
    void getUpcomingMeetings_ShouldReturnFutureMeetings() {
        when(meetingRepository.findByTeamIdAndScheduledAtAfter(eq(1L), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(meeting));

        List<MeetingDTO> result = meetingService.getUpcomingMeetings(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Update Meeting - Should update fields")
    void updateMeeting_ShouldUpdateFields() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        when(meetingRepository.save(any(Meeting.class))).thenReturn(meeting);

        MeetingDTO updateDTO = MeetingDTO.builder()
                .title("Updated Title")
                .build();

        meetingService.updateMeeting(1L, updateDTO, 1L);

        assertEquals("Updated Title", meeting.getTitle());
        verify(meetingRepository).save(meeting);
    }

    @Test
    @DisplayName("Update Meeting Status - Should change status")
    void updateMeetingStatus_ShouldChangeStatus() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        when(meetingRepository.save(any(Meeting.class))).thenReturn(meeting);

        meetingService.updateMeetingStatus(1L, "COMPLETED", 1L);

        assertEquals("COMPLETED", meeting.getStatus());
    }

    @Test
    @DisplayName("Add Meeting Notes - Should add notes and complete")
    void addMeetingNotes_ShouldAddNotesAndComplete() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));
        when(meetingRepository.save(any(Meeting.class))).thenReturn(meeting);

        meetingService.addMeetingNotes(1L, "Meeting minutes...", 1L);

        assertEquals("Meeting minutes...", meeting.getNotes());
        assertEquals("COMPLETED", meeting.getStatus());
    }

    @Test
    @DisplayName("Cancel Meeting - Should cancel and notify")
    void cancelMeeting_ShouldCancelAndNotify() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        meetingService.cancelMeeting(1L, 1L);

        assertEquals("CANCELLED", meeting.getStatus());
        verify(meetingRepository).save(meeting);
        verify(notificationService).sendNotification(eq(1L), eq("MEETING_CANCELLED"), anyString());
    }
}
