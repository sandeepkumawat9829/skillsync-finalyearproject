package com.fyp.service;

import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.CreateProjectRequest;
import com.fyp.model.dto.ProjectDTO;
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
@DisplayName("ProjectService Tests")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private MentorAssignmentRepository mentorAssignmentRepository;

    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @InjectMocks
    private ProjectService projectService;

    private User testUser;
    private Project testProject;
    private Team testTeam;
    private CreateProjectRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        testProject = Project.builder()
                .id(1L)
                .title("Test Project")
                .abstractText("Project abstract")
                .fullDescription("Full description")
                .status(ProjectStatus.TEAM_FORMING)
                .visibility("PRIVATE")
                .expectedOutcome("Outcome")
                .technologies(Arrays.asList("Java", "Spring"))
                .createdBy(testUser)
                .build();

        testTeam = Team.builder()
                .id(1L)
                .project(testProject)
                .teamLeader(testUser)
                .teamName("Test Team")
                .status(TeamStatus.FORMING)
                .build();

        testProject.setTeam(testTeam);

        createRequest = new CreateProjectRequest();
        createRequest.setTitle("New Project");
        createRequest.setAbstractText("Abstract");
        createRequest.setFullDescription("Description");
        createRequest.setDomain("Computer Science");
        createRequest.setVisibility("PUBLIC");
    }

    @Test
    @DisplayName("Create Project - Should create project with team successfully")
    void createProject_ShouldCreateSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        // createProject checks findByCreatedById (not WithDetails)
        when(projectRepository.findByCreatedById(1L)).thenReturn(Collections.emptyList());
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);
        when(teamRepository.save(any(Team.class))).thenReturn(testTeam);
        when(teamMemberRepository.save(any(TeamMember.class))).thenReturn(new TeamMember());

        // toDTO setup
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        // Mentor assignment check uses findByTeamId
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        ProjectDTO result = projectService.createProject(createRequest, 1L);

        // Then
        assertNotNull(result);
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(teamRepository, times(1)).save(any(Team.class));
        verify(teamMemberRepository, times(1)).save(any(TeamMember.class));
    }

    @Test
    @DisplayName("Create Project - Should fail when user not found")
    void createProject_ShouldFailWhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            projectService.createProject(createRequest, 999L);
        });
    }

    @Test
    @DisplayName("Create Project - Should fail when user already has a project")
    void createProject_ShouldFailWhenUserHasProject() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(projectRepository.findByCreatedById(1L)).thenReturn(Arrays.asList(testProject));

        // When & Then
        BusinessRuleViolationException exception = assertThrows(BusinessRuleViolationException.class, () -> {
            projectService.createProject(createRequest, 1L);
        });

        assertTrue(exception.getMessage().contains("already have a project"));
    }

    @Test
    @DisplayName("Get Project - Should return project by ID")
    void getProject_ShouldReturnProjectById() {
        // Given
        // Service uses findByIdWithDetails
        when(projectRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(testProject));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        ProjectDTO result = projectService.getProject(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Project", result.getTitle());
    }

    @Test
    @DisplayName("Get Project - Should fail when project not found")
    void getProject_ShouldFailWhenNotFound() {
        // Given
        when(projectRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            projectService.getProject(999L);
        });
    }

    @Test
    @DisplayName("Get My Projects - Should return user's projects")
    void getMyProjects_ShouldReturnUserProjects() {
        // Given
        // Service uses findByCreatedByIdWithDetails
        when(projectRepository.findByCreatedByIdWithDetails(1L)).thenReturn(Arrays.asList(testProject));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        List<ProjectDTO> result = projectService.getMyProjects(1L);

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Project", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Get Public Projects - Should return only public projects")
    void getPublicProjects_ShouldReturnOnlyPublic() {
        // Given
        testProject.setVisibility("PUBLIC");
        // Service uses findByVisibilityWithDetails
        when(projectRepository.findByVisibilityWithDetails("PUBLIC")).thenReturn(Arrays.asList(testProject));
        // Abstract DTO conversion typically doesn't need mentor info but
        // toDTOWithAbstractOnly might call logic
        // Checking code, toDTOWithAbstractOnly handles strict DTO mapping.
        // Assuming toDTOWithAbstractOnly does NOT call repositories for mentor (since
        // it's lightweight).
        // If it does, we'd need mocks. Let's assume it doesn't for now based on name.

        // When
        List<ProjectDTO> result = projectService.getPublicProjects();

        // Then
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get All Projects - Should return all projects")
    void getAllProjects_ShouldReturnAllProjects() {
        // Given
        Project project2 = Project.builder()
                .id(2L)
                .title("Project 2")
                .abstractText("Abstract 2")
                .status(ProjectStatus.IN_PROGRESS)
                .visibility("PRIVATE")
                .createdBy(testUser)
                .team(testTeam)
                .build();

        // Service uses findAllWithDetails
        when(projectRepository.findAllWithDetails()).thenReturn(Arrays.asList(testProject, project2));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        List<ProjectDTO> result = projectService.getAllProjects();

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get Projects By Status - Should filter by status")
    void getProjectsByStatus_ShouldFilterByStatus() {
        // Given
        // Service uses findByStatus
        when(projectRepository.findByStatus(ProjectStatus.TEAM_FORMING))
                .thenReturn(Arrays.asList(testProject));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());

        // When
        List<ProjectDTO> result = projectService.getProjectsByStatus(ProjectStatus.TEAM_FORMING);

        // Then
        assertEquals(1, result.size());
        assertEquals("TEAM_FORMING", result.get(0).getStatus());
    }
}
