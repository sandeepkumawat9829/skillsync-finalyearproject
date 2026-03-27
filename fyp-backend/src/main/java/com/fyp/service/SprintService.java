package com.fyp.service;

import com.fyp.model.dto.SprintDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Sprint;
import com.fyp.model.enums.SprintStatus;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.SprintRepository;
import com.fyp.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public SprintDTO createSprint(SprintDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

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

        return SprintDTO.builder()
                .sprintId(sprint.getId())
                .projectId(sprint.getProject().getId())
                .sprintNumber(sprint.getSprintNumber())
                .sprintName(sprint.getSprintName())
                .sprintGoal(sprint.getSprintGoal())
                .startDate(sprint.getStartDate())
                .endDate(sprint.getEndDate())
                .status(sprint.getStatus())
                .totalPoints(sprint.getTotalPoints())
                .completedPoints(sprint.getCompletedPoints())
                .velocity(sprint.getVelocity())
                .createdAt(sprint.getCreatedAt())
                .completedAt(sprint.getCompletedAt())
                .taskCount(taskCount)
                .build();
    }
}
