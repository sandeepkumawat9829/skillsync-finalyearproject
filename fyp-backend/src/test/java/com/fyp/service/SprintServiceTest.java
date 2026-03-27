package com.fyp.service;

import com.fyp.model.dto.SprintDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.enums.SprintStatus;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.SprintRepository;
import com.fyp.repository.TaskRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SprintService Tests")
class SprintServiceTest {

    @Mock
    private SprintRepository sprintRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private SprintService sprintService;

    private Project project;
    private Sprint sprint;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Project 1")
                .build();

        sprint = Sprint.builder()
                .id(1L)
                .project(project)
                .sprintNumber(1)
                .sprintName("Sprint 1")
                .status(SprintStatus.PLANNED)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusWeeks(2))
                .build();
    }

    @Test
    @DisplayName("Create Sprint - Should create active if none active")
    void createSprint_ShouldCreateActive() {
        SprintDTO dto = SprintDTO.builder()
                .projectId(1L)
                .sprintName("Sprint 1")
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(sprintRepository.existsByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(false);
        when(sprintRepository.findTopByProjectIdOrderBySprintNumberDesc(1L)).thenReturn(Optional.empty());
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(i -> {
            Sprint s = i.getArgument(0);
            s.setId(1L);
            return s;
        });

        SprintDTO result = sprintService.createSprint(dto);

        assertEquals(SprintStatus.ACTIVE, result.getStatus());
        assertEquals(1, result.getSprintNumber());
    }

    @Test
    @DisplayName("Create Sprint - Should create planned if active exists")
    void createSprint_ShouldCreatePlanned() {
        SprintDTO dto = SprintDTO.builder()
                .projectId(1L)
                .sprintName("Sprint 2")
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(sprintRepository.existsByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(true);
        when(sprintRepository.findTopByProjectIdOrderBySprintNumberDesc(1L)).thenReturn(Optional.of(sprint));
        when(sprintRepository.save(any(Sprint.class))).thenAnswer(i -> i.getArgument(0));

        SprintDTO result = sprintService.createSprint(dto);

        assertEquals(SprintStatus.PLANNED, result.getStatus());
        assertEquals(2, result.getSprintNumber());
    }

    @Test
    @DisplayName("Get Sprints by Project - Should return list")
    void getSprintsByProject_ShouldReturnList() {
        when(sprintRepository.findByProjectIdOrderBySprintNumberDesc(1L))
                .thenReturn(Arrays.asList(sprint));

        List<SprintDTO> result = sprintService.getSprintsByProject(1L);

        assertEquals(1, result.size());
        assertEquals("Sprint 1", result.get(0).getSprintName());
    }

    @Test
    @DisplayName("Start Sprint - Should activate")
    void startSprint_ShouldActivate() {
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(sprint));
        when(sprintRepository.existsByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(false);
        when(sprintRepository.save(any(Sprint.class))).thenReturn(sprint);

        SprintDTO result = sprintService.startSprint(1L);

        assertEquals(SprintStatus.ACTIVE, result.getStatus());
    }

    @Test
    @DisplayName("Start Sprint - Should fail if active exists")
    void startSprint_ShouldFailIfActiveExists() {
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(sprint));
        when(sprintRepository.existsByProjectIdAndStatus(1L, SprintStatus.ACTIVE)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> sprintService.startSprint(1L));
    }

    @Test
    @DisplayName("Complete Sprint - Should complete")
    void completeSprint_ShouldComplete() {
        when(sprintRepository.findById(1L)).thenReturn(Optional.of(sprint));
        when(sprintRepository.save(any(Sprint.class))).thenReturn(sprint);

        SprintDTO result = sprintService.completeSprint(1L);

        assertEquals(SprintStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedAt());
    }
}
