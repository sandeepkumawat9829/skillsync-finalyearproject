package com.fyp.service;

import com.fyp.model.dto.MilestoneDTO;
import com.fyp.model.entity.Milestone;
import com.fyp.model.entity.Milestone.MilestoneStatus;
import com.fyp.model.entity.Project;
import com.fyp.repository.MilestoneRepository;
import com.fyp.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public List<MilestoneDTO> getProjectMilestones(Long projectId) {
        return milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MilestoneDTO getMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        return toDTO(milestone);
    }

    @Transactional
    public MilestoneDTO createMilestone(MilestoneDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Milestone milestone = Milestone.builder()
                .project(project)
                .milestoneName(dto.getMilestoneName())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate())
                .status(MilestoneStatus.PENDING)
                .completionPercentage(0)
                .reviewedByMentor(false)
                .build();

        milestone = milestoneRepository.save(milestone);
        return toDTO(milestone);
    }

    @Transactional
    public MilestoneDTO updateMilestone(Long milestoneId, MilestoneDTO dto) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        if (dto.getMilestoneName() != null) {
            milestone.setMilestoneName(dto.getMilestoneName());
        }
        if (dto.getDescription() != null) {
            milestone.setDescription(dto.getDescription());
        }
        if (dto.getDueDate() != null) {
            milestone.setDueDate(dto.getDueDate());
        }
        if (dto.getCompletionPercentage() != null) {
            milestone.setCompletionPercentage(dto.getCompletionPercentage());
        }

        milestone = milestoneRepository.save(milestone);
        return toDTO(milestone);
    }

    @Transactional
    public MilestoneDTO updateStatus(Long milestoneId, String status) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        MilestoneStatus newStatus = MilestoneStatus.valueOf(status);
        milestone.setStatus(newStatus);

        if (newStatus == MilestoneStatus.COMPLETED) {
            milestone.setCompletionPercentage(100);
            milestone.setCompletedAt(LocalDateTime.now());
        } else if (newStatus == MilestoneStatus.IN_PROGRESS && milestone.getCompletionPercentage() == 0) {
            milestone.setCompletionPercentage(10);
        }

        milestone = milestoneRepository.save(milestone);
        return toDTO(milestone);
    }

    @Transactional
    public MilestoneDTO completeMilestone(Long milestoneId) {
        return updateStatus(milestoneId, "COMPLETED");
    }

    @Transactional
    public MilestoneDTO addMentorReview(Long milestoneId, String feedback) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        milestone.setReviewedByMentor(true);
        milestone.setMentorFeedback(feedback);

        milestone = milestoneRepository.save(milestone);
        return toDTO(milestone);
    }

    public List<MilestoneDTO> getOverdueMilestones(Long projectId) {
        return milestoneRepository.findOverdueMilestones(projectId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MilestoneDTO> getPendingReviews(Long projectId) {
        return milestoneRepository.findByProjectIdAndReviewedByMentorFalseAndStatus(
                projectId, MilestoneStatus.COMPLETED)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Double getProjectProgress(Long projectId) {
        Long total = milestoneRepository.countByProject(projectId);
        if (total == 0)
            return 0.0;
        Long completed = milestoneRepository.countCompletedByProject(projectId);
        return (completed.doubleValue() / total.doubleValue()) * 100;
    }

    @Transactional
    public void deleteMilestone(Long milestoneId) {
        milestoneRepository.deleteById(milestoneId);
    }

    private MilestoneDTO toDTO(Milestone milestone) {
        return MilestoneDTO.builder()
                .milestoneId(milestone.getMilestoneId())
                .projectId(milestone.getProject().getId())
                .projectTitle(milestone.getProject().getTitle())
                .milestoneName(milestone.getMilestoneName())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .status(milestone.getStatus().name())
                .completionPercentage(milestone.getCompletionPercentage())
                .reviewedByMentor(milestone.getReviewedByMentor())
                .mentorFeedback(milestone.getMentorFeedback())
                .createdAt(milestone.getCreatedAt())
                .completedAt(milestone.getCompletedAt())
                .isOverdue(milestone.getDueDate() != null &&
                        milestone.getDueDate().isBefore(LocalDateTime.now()) &&
                        milestone.getStatus() != MilestoneStatus.COMPLETED)
                .build();
    }
}
