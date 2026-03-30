package com.fyp.service;

import com.fyp.model.dto.TaskAssignmentRequest;
import com.fyp.model.dto.TaskBoardReorderItemDTO;
import com.fyp.model.dto.TaskDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.Task;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.model.enums.TaskPriority;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.MentorAssignmentRepository;
import com.fyp.repository.SprintRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.TaskRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private static final Set<String> VALID_COLUMNS = Set.of("TODO", "IN_PROGRESS", "IN_REVIEW", "DONE");
    private static final Map<String, Integer> COLUMN_ORDER = Map.of(
            "TODO", 0, "IN_PROGRESS", 1, "IN_REVIEW", 2, "DONE", 3);

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final SprintRepository sprintRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public TaskDTO createTask(TaskDTO dto, Long creatorId) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        // Only team leader or mentor can create tasks
        if (!isLeaderOrMentor(project, creatorId)) {
            throw new RuntimeException("Only the team leader or mentor can create tasks");
        }

        validateProjectAccess(project, creatorId);

        String status = normalizeColumnName(dto.getStatus());
        User assignedTo = dto.getAssignedTo() != null ? validateAndGetAssignee(project, dto.getAssignedTo()) : null;
        Sprint sprint = dto.getSprintId() != null ? validateAndGetSprint(project, dto.getSprintId()) : null;

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .columnName(status)
                .position(getNextPosition(project.getId(), status))
                .priority(dto.getPriority() != null ? dto.getPriority() : TaskPriority.MEDIUM)
                .project(project)
                .sprint(sprint)
                .createdBy(creator)
                .assignedTo(assignedTo)
                .dueDate(dto.getDueDate())
                .estimatedHours(dto.getEstimatedHours() != null ? BigDecimal.valueOf(dto.getEstimatedHours()) : null)
                .build();

        Task saved = taskRepository.save(task);

        if (assignedTo != null) {
            notificationService.sendNotification(
                    assignedTo.getId(),
                    "TASK_ASSIGNED",
                    "New task assigned: " + task.getTitle());
            String assigneeName = studentProfileRepository.findByUserId(assignedTo.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(assignedTo.getEmail());
            emailService.sendTaskAssignedEmail(
                    assignedTo.getEmail(),
                    assigneeName,
                    task.getTitle(),
                    project.getTitle(),
                    task.getDueDate() != null ? task.getDueDate().toString() : "No Due Date",
                    task.getId().toString()
            );
        }

        TaskDTO response = toDTO(saved);
        broadcastProjectTaskUpdate(saved.getProject().getId(), "TASK_CREATED", response);
        return response;
    }

    @Transactional(readOnly = true)
    public TaskDTO getTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return toDTO(task);
    }

    @Transactional(readOnly = true)
    public TaskDTO getTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        validateProjectAccess(task.getProject(), userId);
        return toDTO(task);
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);

        List<TaskDTO> allTasks = taskRepository.findByProjectIdOrderByColumnNameAscPositionAscCreatedAtAsc(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        // Leader/mentor see all tasks; regular members see only their own
        if (isLeaderOrMentor(project, userId)) {
            return allTasks;
        } else {
            return allTasks.stream()
                    .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().equals(userId))
                    .collect(Collectors.toList());
        }
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksBySprint(Long sprintId, Long userId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
        validateProjectAccess(sprint.getProject(), userId);

        return taskRepository.findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(sprintId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByStatus(Long projectId, String columnName, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);

        return taskRepository.findByProjectIdAndColumnNameOrderByPositionAscCreatedAtAsc(
                        projectId,
                        normalizeColumnName(columnName))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO updateTask(Long taskId, TaskDTO dto, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        validateProjectAccess(task.getProject(), userId);

        if (dto.getTitle() != null) {
            task.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            task.setColumnName(normalizeColumnName(dto.getStatus()));
        }
        if (dto.getPosition() != null) {
            task.setPosition(dto.getPosition());
        }
        if (dto.getPriority() != null) {
            task.setPriority(dto.getPriority());
        }
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }
        if (dto.getEstimatedHours() != null) {
            task.setEstimatedHours(BigDecimal.valueOf(dto.getEstimatedHours()));
        }
        if (dto.getSprintId() != null) {
            task.setSprint(validateAndGetSprint(task.getProject(), dto.getSprintId()));
        }
        if (dto.getActualHours() != null) {
            task.setActualHours(BigDecimal.valueOf(dto.getActualHours()));
        }
        if (dto.getAssignedTo() != null) {
            User newAssignee = validateAndGetAssignee(task.getProject(), dto.getAssignedTo());
            task.setAssignedTo(newAssignee);
            notificationService.sendNotification(
                    newAssignee.getId(),
                    "TASK_ASSIGNED",
                    "Task assigned to you: " + task.getTitle());
            String assigneeName = studentProfileRepository.findByUserId(newAssignee.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(newAssignee.getEmail());
            emailService.sendTaskAssignedEmail(
                    newAssignee.getEmail(),
                    assigneeName,
                    task.getTitle(),
                    task.getProject().getTitle(),
                    task.getDueDate() != null ? task.getDueDate().toString() : "No Due Date",
                    task.getId().toString()
            );
        }

        Task saved = taskRepository.save(task);
        TaskDTO response = toDTO(saved);
        broadcastProjectTaskUpdate(saved.getProject().getId(), "TASK_UPDATED", response);
        return response;
    }

    @Transactional
    public TaskDTO moveTask(Long taskId, String newColumnName, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setColumnName(normalizeColumnName(newColumnName));
        task.setPosition(task.getPosition() != null ? task.getPosition() : 0);
        if ("DONE".equals(task.getColumnName())) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO moveTask(Long taskId, String newColumnName, Integer newPosition, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        validateProjectAccess(task.getProject(), userId);

        String normalizedNew = normalizeColumnName(newColumnName);
        String oldColumn = task.getColumnName();

        // Check backward movement for non-leader/non-mentor
        if (!isLeaderOrMentor(task.getProject(), userId)) {
            int oldOrder = COLUMN_ORDER.getOrDefault(oldColumn, 0);
            int newOrder = COLUMN_ORDER.getOrDefault(normalizedNew, 0);
            if (newOrder < oldOrder) {
                throw new RuntimeException("Only the team leader or mentor can revert task progress");
            }
        }

        task.setColumnName(normalizedNew);
        task.setPosition(newPosition);

        if ("DONE".equals(task.getColumnName())) {
            task.setCompletedAt(LocalDateTime.now());
        } else {
            task.setCompletedAt(null);
        }

        Task saved = taskRepository.save(task);
        TaskDTO response = toDTO(saved);
        broadcastProjectTaskUpdate(saved.getProject().getId(), "TASK_MOVED", response);
        return response;
    }

    @Transactional
    public List<TaskDTO> reorderTasks(Long projectId, List<TaskBoardReorderItemDTO> updates, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        validateProjectAccess(project, userId);

        Map<Long, Task> tasksById = taskRepository.findByProjectIdOrderByColumnNameAscPositionAscCreatedAtAsc(projectId)
                .stream()
                .collect(Collectors.toMap(Task::getId, task -> task));

        for (TaskBoardReorderItemDTO update : updates) {
            Task task = tasksById.get(update.getTaskId());
            if (task == null) {
                throw new RuntimeException("Task not found in project: " + update.getTaskId());
            }

            task.setColumnName(normalizeColumnName(update.getStatus()));
            task.setPosition(update.getPosition());
            if ("DONE".equals(task.getColumnName())) {
                if (task.getCompletedAt() == null) {
                    task.setCompletedAt(LocalDateTime.now());
                }
            } else {
                task.setCompletedAt(null);
            }
        }

        List<Task> savedTasks = taskRepository.saveAll(tasksById.values().stream()
                .sorted(Comparator.comparing(Task::getColumnName)
                        .thenComparing(Task::getPosition)
                        .thenComparing(Task::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList());

        List<TaskDTO> result = savedTasks.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        broadcastProjectTaskUpdate(projectId, "TASKS_REORDERED", result);
        return result;
    }

    @Transactional
    public TaskDTO assignTask(Long taskId, TaskAssignmentRequest request, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        validateProjectAccess(task.getProject(), userId);

        User assignee = null;
        if (request.getUserId() != null) {
            assignee = validateAndGetAssignee(task.getProject(), request.getUserId());
            notificationService.sendNotification(
                    assignee.getId(),
                    "TASK_ASSIGNED",
                    "Task assigned to you: " + task.getTitle());
            String assigneeName = studentProfileRepository.findByUserId(assignee.getId())
                    .map(StudentProfile::getFullName)
                    .orElse(assignee.getEmail());
            emailService.sendTaskAssignedEmail(
                    assignee.getEmail(),
                    assigneeName,
                    task.getTitle(),
                    task.getProject().getTitle(),
                    task.getDueDate() != null ? task.getDueDate().toString() : "No Due Date",
                    task.getId().toString()
            );
        }

        task.setAssignedTo(assignee);
        Task saved = taskRepository.save(task);
        TaskDTO response = toDTO(saved);
        broadcastProjectTaskUpdate(saved.getProject().getId(), "TASK_ASSIGNED", response);
        return response;
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        validateProjectAccess(task.getProject(), userId);

        Long projectId = task.getProject().getId();
        taskRepository.delete(task);
        broadcastProjectTaskUpdate(projectId, "TASK_DELETED", Map.of("taskId", taskId));
    }

    private TaskDTO toDTO(Task task) {
        String creatorName = studentProfileRepository.findByUserId(task.getCreatedBy().getId())
                .map(StudentProfile::getFullName)
                .orElse(task.getCreatedBy().getEmail());

        return TaskDTO.builder()
                .taskId(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getColumnName())
                .position(task.getPosition())
                .priority(task.getPriority())
                .projectId(task.getProject().getId())
                .projectTitle(task.getProject().getTitle())
                .sprintId(task.getSprint() != null ? task.getSprint().getId() : null)
                .teamId(task.getProject().getTeam() != null ? task.getProject().getTeam().getId() : null)
                .assignedTo(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getEmail() : null)
                .createdBy(task.getCreatedBy().getId())
                .createdByName(creatorName)
                .dueDate(task.getDueDate())
                .completedAt(task.getCompletedAt())
                .estimatedHours(task.getEstimatedHours() != null ? task.getEstimatedHours().intValue() : null)
                .actualHours(task.getActualHours() != null ? task.getActualHours().intValue() : null)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .tags(java.util.Collections.emptyList())
                .build();
    }

    private Integer getNextPosition(Long projectId, String columnName) {
        return taskRepository.findMaxPositionByProjectIdAndColumnName(projectId, columnName) + 1;
    }

    private String normalizeColumnName(String columnName) {
        String normalized = columnName == null ? "TODO" : columnName.trim().toUpperCase();
        if (!VALID_COLUMNS.contains(normalized)) {
            throw new RuntimeException("Invalid task status: " + columnName);
        }
        return normalized;
    }

    private User validateAndGetAssignee(Project project, Long assignedUserId) {
        User assignedTo = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("Assigned user not found"));

        Team team = teamRepository.findByProjectId(project.getId())
                .orElseThrow(() -> new RuntimeException("No team found for this project"));
        if (!teamMemberRepository.existsByTeamIdAndUserId(team.getId(), assignedUserId)) {
            throw new RuntimeException("Assigned user must be a member of the project team");
        }

        return assignedTo;
    }

    private Sprint validateAndGetSprint(Project project, Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
        if (sprint.getProject() == null || !sprint.getProject().getId().equals(project.getId())) {
            throw new RuntimeException("Sprint does not belong to this project");
        }
        return sprint;
    }

    private void validateProjectAccess(Project project, Long userId) {
        if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
            return;
        }

        Team team = teamRepository.findByProjectId(project.getId())
                .orElseThrow(() -> new RuntimeException("Project team not found"));

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId);
        boolean isAssignedMentor = mentorAssignmentRepository.findByTeamId(team.getId())
                .map(assignment -> assignment.getMentor() != null && assignment.getMentor().getId().equals(userId))
                .orElse(false);

        if (!isLeader && !isMember && !isAssignedMentor) {
            throw new RuntimeException("You do not have access to this project's tasks");
        }
    }

    private void broadcastProjectTaskUpdate(Long projectId, String eventType, Object payload) {
        messagingTemplate.convertAndSend(
                "/topic/projects/" + projectId + "/tasks",
                Map.of("eventType", eventType, "payload", payload));
    }

    private boolean isLeaderOrMentor(Project project, Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        // Admin always has full access
        if (user.getRole() == com.fyp.model.enums.Role.ADMIN) return true;

        // Mentor role check
        if (user.getRole() == com.fyp.model.enums.Role.MENTOR) {
            Team team = teamRepository.findByProjectId(project.getId()).orElse(null);
            if (team != null) {
                return mentorAssignmentRepository.findByTeamId(team.getId())
                        .map(a -> a.getMentor() != null && a.getMentor().getId().equals(userId))
                        .orElse(false);
            }
            return false;
        }

        // Team leader check
        Team team = teamRepository.findByProjectId(project.getId()).orElse(null);
        if (team != null && team.getTeamLeader() != null) {
            return team.getTeamLeader().getId().equals(userId);
        }

        // Project creator
        return project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId);
    }
}
