package com.fyp.service;

import com.fyp.model.dto.AnalyticsDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.SprintStatus;
import com.fyp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnalyticsService Tests")
class AnalyticsServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private SprintRepository sprintRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TimeEntryRepository timeEntryRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private MentorAssignmentRepository mentorAssignmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Project project;
    private Sprint activeSprint;
    private Sprint completedSprint;
    private Task taskTodo;
    private Task taskDone;
    private User user;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .build();

        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .build();

        activeSprint = Sprint.builder()
                .id(1L)
                .sprintName("Sprint 2")
                .status(SprintStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(5))
                .endDate(LocalDateTime.now().plusDays(5))
                .totalPoints(20)
                .completedPoints(10)
                .build();

        completedSprint = Sprint.builder()
                .id(2L)
                .sprintName("Sprint 1")
                .status(SprintStatus.COMPLETED)
                .startDate(LocalDateTime.now().minusDays(20))
                .endDate(LocalDateTime.now().minusDays(10))
                .totalPoints(20)
                .completedPoints(18)
                .build();

        taskTodo = Task.builder()
                .id(1L)
                .title("Task Todo")
                .columnName("TODO")
                .assignedTo(user)
                .build();

        taskDone = Task.builder()
                .id(2L)
                .title("Task Done")
                .columnName("DONE")
                .assignedTo(user)
                .build();
    }

    @Test
    @DisplayName("Get Project Analytics - Should return full analytics DTO")
    void getProjectAnalytics_ShouldReturnFullAnalytics() {
        when(taskRepository.findByProjectId(1L)).thenReturn(Arrays.asList(taskTodo, taskDone));
        when(sprintRepository.findByProjectIdOrderBySprintNumberDesc(1L))
                .thenReturn(Arrays.asList(activeSprint, completedSprint));
        when(taskRepository.findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(1L))
                .thenReturn(Arrays.asList(taskTodo, taskDone));
        when(taskRepository.findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(2L))
                .thenReturn(Collections.singletonList(taskDone));
        when(timeEntryRepository.sumHoursByProjectId(1L)).thenReturn(new BigDecimal("10.5"));
        when(studentProfileRepository.findByUserId(1L))
                .thenReturn(Optional.of(StudentProfile.builder().fullName("Aarav Sharma").build()));

        AnalyticsDTO result = analyticsService.getProjectAnalytics(1L);

        assertNotNull(result);

        // Verify Task Distribution & Completion
        assertEquals(2, result.getTotalTasksCompleted() + result.getTasksByStatus().getOrDefault("TODO", 0)); // Total
                                                                                                              // tasks
                                                                                                              // Logic
                                                                                                              // in
                                                                                                              // service
                                                                                                              // is
                                                                                                              // totalTasks
                                                                                                              // =
                                                                                                              // list.size()
        assertEquals(50.0, result.getCompletionRate()); // 1 done out of 2 total
        assertEquals(1, result.getTotalTasksCompleted());

        // Verify Velocity
        assertEquals(1, result.getCurrentVelocity());
        assertEquals(1.0, result.getAverageVelocity());
        assertEquals(2, result.getVelocityData().size());
        assertEquals("Sprint 2", result.getVelocityData().get(0).getSprintName());

        // Verify Team Contribution
        assertFalse(result.getContributionData().isEmpty());
        assertEquals("Aarav Sharma", result.getContributionData().get(0).getMemberName());
        assertEquals(1, result.getContributionData().get(0).getTasksCompleted());

        // Verify Time Metrics
        assertEquals(10.5, result.getTimeMetrics().getTotalHoursLogged());
        assertEquals(10.5, result.getTimeMetrics().getAverageHoursPerTask()); // 10.5 / 1 completed task

        // Verify Team Efficiency
        assertEquals("medium", result.getTeamEfficiency()); // 50%
    }

    @Test
    @DisplayName("Get Project Analytics - Should handle empty data gracefully")
    void getProjectAnalytics_ShouldHandleEmptyData() {
        when(taskRepository.findByProjectId(1L)).thenReturn(Collections.emptyList());
        when(sprintRepository.findByProjectIdOrderBySprintNumberDesc(1L)).thenReturn(Collections.emptyList());
        when(timeEntryRepository.sumHoursByProjectId(1L)).thenReturn(null);

        AnalyticsDTO result = analyticsService.getProjectAnalytics(1L);

        assertNotNull(result);
        assertEquals(0, result.getCompletionRate());
        assertEquals(0, result.getCurrentVelocity());
        assertEquals(0, result.getAverageVelocity());
        assertTrue(result.getVelocityData().isEmpty());
        assertTrue(result.getBurndownData().isEmpty());
        assertTrue(result.getContributionData().isEmpty());
        assertEquals(0.0, result.getTimeMetrics().getTotalHoursLogged());
        assertEquals("low", result.getTeamEfficiency());
    }

    @Test
    @DisplayName("Get Project Analytics - Verify Burndown Calculation")
    void getProjectAnalytics_VerifyBurndown() {
        // Only mocking active sprint to verify burndown logic specific to it
        when(taskRepository.findByProjectId(1L)).thenReturn(Collections.emptyList());
        when(sprintRepository.findByProjectIdOrderBySprintNumberDesc(1L))
                .thenReturn(Arrays.asList(activeSprint));
        when(taskRepository.findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(1L))
                .thenReturn(Arrays.asList(taskTodo, taskDone));
        when(timeEntryRepository.sumHoursByProjectId(1L)).thenReturn(BigDecimal.ZERO);

        AnalyticsDTO result = analyticsService.getProjectAnalytics(1L);

        assertFalse(result.getBurndownData().isEmpty());
        // Start date (-5 days) to End date (+5 days) is approx 11 days inclusive
        assertEquals(11, result.getBurndownData().size());

        // Check first point (Ideal should be Max, Actual depends on logic)
        assertEquals(2, result.getBurndownData().get(0).getIdealRemaining());
    }
}
