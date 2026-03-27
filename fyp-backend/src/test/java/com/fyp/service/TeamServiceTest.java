package com.fyp.service;

import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.TeamDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.*;
import com.fyp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TeamService Tests")
class TeamServiceTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private TeamInvitationRepository teamInvitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private MentorAssignmentRepository mentorAssignmentRepository;

    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @InjectMocks
    private TeamService teamService;

    private User testUser;
    private User testUser2;
    private Project testProject;
    private Team testTeam;
    private TeamMember testMember;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("leader@example.com")
                .role(Role.STUDENT)
                .build();

        testUser2 = User.builder()
                .id(2L)
                .email("member@example.com")
                .role(Role.STUDENT)
                .build();

        testProject = Project.builder()
                .id(1L)
                .title("Test Project")
                .status(ProjectStatus.TEAM_FORMING)
                .createdBy(testUser)
                .build();

        testTeam = Team.builder()
                .id(1L)
                .project(testProject)
                .teamLeader(testUser)
                .teamName("Test Team")
                .status(TeamStatus.FORMING)
                .maxMembers(4)
                .currentMemberCount(1) // Initialize
                .build();

        testProject.setTeam(testTeam);

        testMember = TeamMember.builder()
                .id(1L)
                .team(testTeam)
                .user(testUser)
                .role(MemberRole.LEADER)
                .build();

        testTeam.setMembers(Arrays.asList(testMember));
    }

    @Test
    @DisplayName("Get Team - Should return team by ID")
    void getTeam_ShouldReturnTeamById() {
        // Given
        when(teamRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testTeam));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        TeamDTO result = teamService.getTeam(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Team", result.getTeamName());
    }

    @Test
    @DisplayName("Get Team - Should fail when team not found")
    void getTeam_ShouldFailWhenNotFound() {
        // Given
        when(teamRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            teamService.getTeam(999L);
        });
    }

    @Test
    @DisplayName("Get Team By Project - Should return project's team")
    void getTeamByProject_ShouldReturnProjectTeam() {
        // Given
        // Service uses findByProjectIdWithDetails
        when(teamRepository.findByProjectIdWithDetails(anyLong())).thenReturn(Optional.of(testTeam));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        TeamDTO result = teamService.getTeamByProject(1L);

        // Then
        assertNotNull(result);
        assertEquals(1L, result.getProjectId());
    }

    @Test
    @DisplayName("Get My Team - Should return user's team")
    void getMyTeam_ShouldReturnUserTeam() {
        // Given
        when(teamMemberRepository.findByUserId(1L)).thenReturn(Arrays.asList(testMember));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        TeamDTO result = teamService.getMyTeam(1L);

        // Then
        assertNotNull(result);
    }

    @Test
    @DisplayName("Get My Team - Should return null when user has no team")
    void getMyTeam_ShouldReturnNullWhenNoTeam() {
        // Given
        when(teamMemberRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // When
        TeamDTO result = teamService.getMyTeam(1L);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Invite Member - Should create invitation successfully")
    void inviteMember_ShouldCreateInvitation() {
        // Given
        when(teamRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findById(2L)).thenReturn(Optional.of(testUser2));
        when(teamMemberRepository.findByUserId(2L)).thenReturn(Collections.emptyList());
        when(teamInvitationRepository.findByTeamId(1L)).thenReturn(Collections.emptyList());
        when(teamInvitationRepository.save(any(TeamInvitation.class))).thenReturn(new TeamInvitation());

        // When
        teamService.inviteMember(1L, 2L, 1L, "Join our team!");

        // Then
        verify(teamInvitationRepository, times(1)).save(any(TeamInvitation.class));
        verify(notificationService, times(1)).sendNotification(anyLong(), anyString(), anyString(), anyString(),
                anyString());
    }

    @Test
    @DisplayName("Invite Member - Should fail when team is full")
    void inviteMember_ShouldFailWhenTeamFull() {
        // Given
        TeamMember member2 = TeamMember.builder().id(2L).team(testTeam).user(testUser2).build();
        TeamMember member3 = TeamMember.builder().id(3L).team(testTeam).build();
        TeamMember member4 = TeamMember.builder().id(4L).team(testTeam).build();
        testTeam.setMembers(Arrays.asList(testMember, member2, member3, member4));
        testTeam.setCurrentMemberCount(4); // Manual update since it is a persistent field

        when(teamRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testTeam));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.findById(5L)).thenReturn(Optional.of(User.builder().id(5L).build()));

        // When & Then
        assertThrows(BusinessRuleViolationException.class, () -> {
            teamService.inviteMember(1L, 5L, 1L, "Join!");
        });
    }

    @Test
    @DisplayName("Get My Pending Invitations - Should return user's pending invitations")
    void getMyPendingInvitations_ShouldReturnPendingInvitations() {
        // Given
        TeamInvitation invitation = TeamInvitation.builder()
                .id(1L)
                .team(testTeam)
                .toUser(testUser2)
                .fromUser(testUser)
                .status(InvitationStatus.PENDING)
                .build();

        when(teamInvitationRepository.findByToUserIdAndStatus(2L, InvitationStatus.PENDING))
                .thenReturn(Arrays.asList(invitation));

        // When
        var result = teamService.getMyPendingInvitations(2L);

        // Then
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Incomplete Teams - Should return teams that are forming")
    void getIncompleteTeams_ShouldReturnFormingTeams() {
        // Given
        when(teamRepository.findIncompleteTeamsWithDetails())
                .thenReturn(Arrays.asList(testTeam));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        List<TeamDTO> result = teamService.getIncompleteTeams();

        // Then
        assertEquals(1, result.size());
        assertEquals(TeamStatus.FORMING.name(), result.get(0).getStatus());
    }
}
