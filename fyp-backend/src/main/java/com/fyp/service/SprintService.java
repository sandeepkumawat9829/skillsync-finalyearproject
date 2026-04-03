package com.fyp.service;

import com.fyp.model.dto.SprintDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.entity.User;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.SprintStatus;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.SprintRepository;
import com.fyp.repository.TaskRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public SprintDTO createSprint(SprintDTO dto, String userEmail) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Validate that user is team leader or mentor
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMentor = user.getRole() == Role.MENTOR;
        boolean isTeamLeader = project.getTeam() != null
                && project.getTeam().getTeamLeader() != null
                && project.getTeam().getTeamLeader().getId().equals(user.getId());

        if (!isMentor && !isTeamLeader) {
            throw new RuntimeException("Only team leaders and mentors can create sprints");
        }

        LocalDate today = LocalDate.now();
        if (dto.getStartDate() != null && dto.getStartDate().toLocalDate().isBefore(today)) {
            throw new RuntimeException("Sprint start date cannot be in the past");
        }
        if (dto.getEndDate() != null && dto.getEndDate().toLocalDate().isBefore(today)) {
            throw new RuntimeException("Sprint end date cannot be in the past");
        }
        if (dto.getStartDate() != null && dto.getEndDate() != null && dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Sprint start date cannot be after end date");
        }

        // Check if there's already an active sprint
        boolean hasActiveSprint = sprintRepository.existsByProjectIdAndStatus(
                dto.getProjectId(), SprintStatus.ACTIVE);

        // Get next sprint number
        Integer nextNumber = sprintRepository.findTopByProjectIdOrderBySprintNumberDesc(dto.getProjectId())
                .map(s -> s.getSprintNumber() + 1)
                .orElse(1);

        Sprint sprint = Sprint.builder()
                .project(project)
                .sprintNumber(nextNumber)
                .sprintName(dto.getSprintName())
                .sprintGoal(dto.getSprintGoal())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .status(hasActiveSprint ? SprintStatus.PLANNED : SprintStatus.ACTIVE)
                .totalPoints(0)
                .completedPoints(0)
                .velocity(0)
                .build();

        Sprint saved = sprintRepository.save(sprint);
        return toDTO(saved);
    }

    public SprintDTO getSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
        return toDTO(sprint);
    }

    public List<SprintDTO> getSprintsByProject(Long projectId) {
        return sprintRepository.findByProjectIdOrderBySprintNumberDesc(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SprintDTO getActiveSprint(Long projectId) {
        return sprintRepository.findByProjectIdAndStatus(projectId, SprintStatus.ACTIVE)
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional
    public SprintDTO updateSprint(Long sprintId, SprintDTO dto) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        LocalDateTime startDateToCompare = dto.getStartDate() != null ? dto.getStartDate() : sprint.getStartDate();
        LocalDateTime endDateToCompare = dto.getEndDate() != null ? dto.getEndDate() : sprint.getEndDate();

        if (startDateToCompare != null && endDateToCompare != null && startDateToCompare.isAfter(endDateToCompare)) {
            throw new RuntimeException("Sprint start date cannot be after end date");
        }

        if (dto.getSprintName() != null)
            sprint.setSprintName(dto.getSprintName());
        if (dto.getSprintGoal() != null)
            sprint.setSprintGoal(dto.getSprintGoal());
        if (dto.getStartDate() != null)
            sprint.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            sprint.setEndDate(dto.getEndDate());
        if (dto.getTotalPoints() != null)
            sprint.setTotalPoints(dto.getTotalPoints());
        if (dto.getCompletedPoints() != null)
            sprint.setCompletedPoints(dto.getCompletedPoints());

        return toDTO(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDTO startSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        // Check if there's already an active sprint for this project
        boolean hasActiveSprint = sprintRepository.existsByProjectIdAndStatus(
                sprint.getProject().getId(), SprintStatus.ACTIVE);

        if (hasActiveSprint) {
            throw new RuntimeException("Project already has an active sprint. Complete it first.");
        }

        sprint.setStatus(SprintStatus.ACTIVE);
        return toDTO(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintDTO completeSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));

        if (sprint.getTasks() == null || sprint.getTasks().isEmpty()) {
            throw new RuntimeException("Cannot complete a sprint with no tasks");
        }
        long doneTasks = sprint.getTasks().stream()
                .filter(t -> "DONE".equals(t.getColumnName())).count();
        if (doneTasks == 0) {
            throw new RuntimeException("Cannot complete sprint: no tasks have been completed. At least one task must be done.");
        }

        sprint.setStatus(SprintStatus.COMPLETED);
        sprint.setCompletedAt(LocalDateTime.now());
        sprint.setVelocity(sprint.getCompletedPoints());

        return toDTO(sprintRepository.save(sprint));
    }

    @Transactional
    public void deleteSprint(Long sprintId) {
        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new RuntimeException("Sprint not found"));
        sprintRepository.delete(sprint);
    }

    private SprintDTO toDTO(Sprint sprint) {
        int taskCount = sprint.getTasks() != null ? sprint.getTasks().size() : 0;
        
        int dynamicTotalPoints = 0;
        int dynamicCompletedPoints = 0;

        if (sprint.getTasks() != null) {
            for (com.fyp.model.entity.Task t : sprint.getTasks()) {
                int points = t.getEstimatedHours() != null ? t.getEstimatedHours().intValue() : 1;
                dynamicTotalPoints += points;
                if ("DONE".equals(t.getColumnName())) {
                    dynamicCompletedPoints += points;
                }
            }
        }

        // Use dynamically calculated points, falling back to stored points if tasks aren't loaded
        int finalTotal = dynamicTotalPoints > 0 ? dynamicTotalPoints : (sprint.getTotalPoints() != null ? sprint.getTotalPoints() : 0);
        int finalCompleted = dynamicCompletedPoints > 0 ? dynamicCompletedPoints : (sprint.getCompletedPoints() != null ? sprint.getCompletedPoints() : 0);
        
        // If sprint is completed, velocity is the completed points
        int velocity = sprint.getStatus() == SprintStatus.COMPLETED ? finalCompleted : (sprint.getVelocity() != null ? sprint.getVelocity() : 0);

        return SprintDTO.builder()
                .sprintId(sprint.getId())
                .projectId(sprint.getProject().getId())
                .sprintNumber(sprint.getSprintNumber())
                .sprintName(sprint.getSprintName())
                .sprintGoal(sprint.getSprintGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .totalPoints(finalTotal)
                .completedPoints(finalCompleted)
                .velocity(velocity)
                .createdAt(sprint.getCreatedAt())
                .completedAt(sprint.getCompletedAt())
                .taskCount(taskCount)
                .build();
    }
}
