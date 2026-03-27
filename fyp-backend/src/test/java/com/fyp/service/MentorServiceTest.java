package com.fyp.service;

import com.fyp.model.dto.MentorProfileDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.InvitationStatus;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MentorService Tests")
class MentorServiceTest {

    @Mock
    private MentorRequestRepository mentorRequestRepository;
    @Mock
    private MentorAssignmentRepository mentorAssignmentRepository;
    @Mock
    private MentorProfileRepository mentorProfileRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MentorService mentorService;

    private User student;
    private User mentor;
    private MentorProfile mentorProfile;
    private Project project;
    private Team team;
    private MentorRequest mentorRequest;

    @BeforeEach
    void setUp() {
        student = User.builder().id(1L).email("student@test.com").build();
        mentor = User.builder().id(2L).email("mentor@test.com").build();

        mentorProfile = MentorProfile.builder()
                .id(1L)
                .user(mentor)
                .fullName("Dr. Mentor")
                .maxProjectsAllowed(5)
                .currentProjectCount(0)
                .build();

        project = Project.builder()
                .id(1L)
                .title("FYP Project")
                .status(ProjectStatus.TEAM_COMPLETE)
                .build();

        TeamMember member = TeamMember.builder().user(student).build();
        team = Team.builder()
                .id(1L)
                .teamName("Team A")
                .teamLeader(student)
                .project(project)
                .members(Collections.singletonList(member))
                .status(TeamStatus.COMPLETE)
                .build();

        mentorRequest = MentorRequest.builder()
                .id(1L)
                .team(team)
                .mentor(mentor)
                .project(project)
                .status(InvitationStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Get Available Mentors - Should return filtered list")
    void getAvailableMentors_ShouldReturnList() {
        when(mentorProfileRepository.findAll()).thenReturn(Collections.singletonList(mentorProfile));

        List<MentorProfileDTO> result = mentorService.getAvailableMentors();

        assertEquals(1, result.size());
        assertEquals("Dr. Mentor", result.get(0).getFullName());
    }

    @Test
    @DisplayName("Send Mentor Request - Should success")
    void sendMentorRequest_ShouldSuccess() {
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mentor));
        when(mentorAssignmentRepository.findByTeamId(1L)).thenReturn(Optional.empty());
        when(mentorProfileRepository.findByUserId(2L)).thenReturn(Optional.of(mentorProfile));
        when(mentorRequestRepository.findByTeamId(1L)).thenReturn(Collections.emptyList());

        mentorService.sendMentorRequest(1L, 2L, 1L, "Please mentor us");

        verify(mentorRequestRepository).save(any(MentorRequest.class));
        verify(notificationService).sendNotification(eq(2L), eq("MENTOR_REQUEST"), anyString(), anyString(),
                anyString());
        assertEquals(TeamStatus.MENTOR_REQUESTED, team.getStatus());
        assertEquals(ProjectStatus.PENDING_MENTOR, project.getStatus());
    }

    @Test
    @DisplayName("Send Mentor Request - Should fail if not team leader")
    void sendMentorRequest_ShouldFailIfNotLeader() {
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mentor));

        assertThrows(RuntimeException.class, () -> mentorService.sendMentorRequest(1L, 2L, 99L, "Msg"));
    }

    @Test
    @DisplayName("Accept Mentor Request - Should success")
    void acceptMentorRequest_ShouldSuccess() {
        when(mentorRequestRepository.findById(1L)).thenReturn(Optional.of(mentorRequest));
        when(mentorProfileRepository.findByUserId(2L)).thenReturn(Optional.of(mentorProfile));

        mentorService.acceptMentorRequest(1L, 2L);

        assertEquals(InvitationStatus.ACCEPTED, mentorRequest.getStatus());
        assertEquals(1, mentorProfile.getCurrentProjectCount());
        assertEquals(TeamStatus.ACTIVE, team.getStatus());
        assertEquals(ProjectStatus.MENTOR_ASSIGNED, project.getStatus());

        verify(mentorAssignmentRepository).save(any(MentorAssignment.class));
        verify(notificationService).sendNotification(eq(1L), eq("MENTOR_ACCEPTED"), anyString(), anyString(),
                anyString());
    }

    @Test
    @DisplayName("Reject Mentor Request - Should success")
    void rejectMentorRequest_ShouldSuccess() {
        when(mentorRequestRepository.findById(1L)).thenReturn(Optional.of(mentorRequest));
        when(mentorProfileRepository.findByUserId(2L)).thenReturn(Optional.of(mentorProfile));

        mentorService.rejectMentorRequest(1L, 2L);

        assertEquals(InvitationStatus.REJECTED, mentorRequest.getStatus());
        assertEquals(TeamStatus.COMPLETE, team.getStatus());
        assertEquals(ProjectStatus.TEAM_COMPLETE, project.getStatus());

        verify(notificationService).sendNotification(eq(1L), eq("MENTOR_REJECTED"), anyString(), anyString(),
                anyString());
    }
}
