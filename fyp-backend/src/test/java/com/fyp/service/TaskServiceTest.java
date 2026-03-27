package com.fyp.service;

import com.fyp.model.dto.TaskDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.entity.Task;
import com.fyp.model.entity.User;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.Team;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.TaskPriority;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.MentorAssignmentRepository;
import com.fyp.repository.SprintRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.TaskRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private SprintRepository sprintRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private MentorAssignmentRepository mentorAssignmentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Project testProject;
    private Task testTask;
    private TaskDTO testTaskDTO;
    private Team testTeam;

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
                .createdBy(testUser)
                .build();

        testTeam = Team.builder()
                .id(1L)
                .project(testProject)
                .teamLeader(testUser)
                .build();

        testTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Task description")
                .columnName("TODO")
                .priority(TaskPriority.MEDIUM)
                .project(testProject)
                .createdBy(testUser)
                .build();

        testTaskDTO = TaskDTO.builder()
                .title("New Task")
                .description("New task description")
                .projectId(1L)
                .status("TODO")
                .priority(TaskPriority.HIGH)
                .build();

        when(teamRepository.findByProjectId(anyLong())).thenReturn(Optional.of(testTeam));
        when(teamMemberRepository.existsByTeamIdAndUserId(anyLong(), anyLong())).thenReturn(true);
        when(mentorAssignmentRepository.findByTeamId(anyLong())).thenReturn(Optional.empty());
        when(taskRepository.findMaxPositionByProjectIdAndColumnName(anyLong(), anyString())).thenReturn(0);
    }

    @Test
    @DisplayName("Create Task - Should create task successfully")
    void createTask_ShouldCreateSuccessfully() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(testProject));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        TaskDTO result = taskService.createTask(testTaskDTO, 1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Create Task - Should fail when project not found")
    void createTask_ShouldFailWhenProjectNotFound() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.createTask(testTaskDTO, 1L);
        });

        assertEquals("Project not found", exception.getMessage());
    }

    @Test
    @DisplayName("Get Task - Should return task by ID")
    void getTask_ShouldReturnTaskById() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        TaskDTO result = taskService.getTask(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
    }

    @Test
    @DisplayName("Get Task - Should fail when task not found")
    void getTask_ShouldFailWhenNotFound() {
        // Given
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            taskService.getTask(999L);
        });

        assertEquals("Task not found", exception.getMessage());
    }

    @Test
    @DisplayName("Get Tasks By Project - Should return all project tasks")
    void getTasksByProject_ShouldReturnAllProjectTasks() {
        // Given
        Task task2 = Task.builder()
                .id(2L)
                .title("Task 2")
                .columnName("IN_PROGRESS")
                .project(testProject)
                .createdBy(testUser)
                .build();

        when(taskRepository.findByProjectId(1L)).thenReturn(Arrays.asList(testTask, task2));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        List<TaskDTO> result = taskService.getTasksByProject(1L);

        // Then
        assertEquals(2, result.size());
    }

    @Test
    @DisplayName("Get Tasks By User - Should return user's tasks")
    void getTasksByUser_ShouldReturnUserTasks() {
        // Given
        when(taskRepository.findByAssignedToId(1L)).thenReturn(Arrays.asList(testTask));
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        List<TaskDTO> result = taskService.getTasksByUser(1L);

        // Then
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Move Task - Should move task to new column")
    void moveTask_ShouldMoveToNewColumn() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        TaskDTO result = taskService.moveTask(1L, "IN_PROGRESS", 1L);

        // Then
        assertNotNull(result);
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Move Task to Done - Should set completion time")
    void moveTaskToDone_ShouldSetCompletionTime() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            return saved;
        });
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        taskService.moveTask(1L, "DONE", 1L);

        // Then
        assertNotNull(testTask.getCompletedAt());
    }

    @Test
    @DisplayName("Delete Task - Should delete task")
    void deleteTask_ShouldDeleteTask() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        doNothing().when(taskRepository).delete(any(Task.class));

        // When
        taskService.deleteTask(1L, 1L);

        // Then
        verify(taskRepository, times(1)).delete(testTask);
    }

    @Test
    @DisplayName("Update Task - Should update task fields")
    void updateTask_ShouldUpdateFields() {
        // Given
        TaskDTO updateDTO = TaskDTO.builder()
                .title("Updated Title")
                .description("Updated Description")
                .status("IN_PROGRESS")
                .priority(TaskPriority.HIGH)
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);
        when(studentProfileRepository.findByUserId(anyLong())).thenReturn(Optional.of(
                StudentProfile.builder().fullName("Test User").build()));

        // When
        TaskDTO result = taskService.updateTask(1L, updateDTO, 1L);

        // Then
        assertNotNull(result);
        verify(taskRepository, times(1)).save(any(Task.class));
    }
}
