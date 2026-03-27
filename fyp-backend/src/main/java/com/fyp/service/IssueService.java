package com.fyp.service;

import com.fyp.model.dto.IssueCommentDTO;
import com.fyp.model.dto.IssueDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.IssueStatus;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    @Transactional
    public IssueDTO createIssue(IssueDTO dto, Long reporterId) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User assignee = null;
        if (dto.getAssignedTo() != null) {
            assignee = userRepository.findById(dto.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
        }

        Issue issue = Issue.builder()
                .project(project)
                .reportedBy(reporter)
                .assignedTo(assignee)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .issueType(dto.getIssueType())
                .priority(dto.getPriority())
                .status(IssueStatus.OPEN)
                .build();

        Issue saved = issueRepository.save(issue);

        // Notify assignee
        if (assignee != null) {
            notificationService.sendNotification(
                    assignee.getId(),
                    "ISSUE_ASSIGNED",
                    "New issue assigned: " + issue.getTitle());
        }

        return toDTO(saved);
    }

    public IssueDTO getIssue(Long issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        return toDTO(issue);
    }

    public List<IssueDTO> getIssuesByProject(Long projectId) {
        return issueRepository.findByProjectId(projectId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssuesByUser(Long userId) {
        return issueRepository.findByAssignedToId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<IssueDTO> getIssuesByStatus(Long projectId, IssueStatus status) {
        return issueRepository.findByProjectIdAndStatus(projectId, status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public IssueDTO updateIssue(Long issueId, IssueDTO dto, Long userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (dto.getTitle() != null)
            issue.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            issue.setDescription(dto.getDescription());
        if (dto.getPriority() != null)
            issue.setPriority(dto.getPriority());

        if (dto.getStatus() != null) {
            issue.setStatus(dto.getStatus());
            if (dto.getStatus() == IssueStatus.RESOLVED || dto.getStatus() == IssueStatus.CLOSED) {
                issue.setResolvedAt(LocalDateTime.now());
            }
        }

        if (dto.getAssignedTo() != null) {
            User newAssignee = userRepository.findById(dto.getAssignedTo())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            issue.setAssignedTo(newAssignee);

            notificationService.sendNotification(
                    newAssignee.getId(),
                    "ISSUE_ASSIGNED",
                    "Issue assigned to you: " + issue.getTitle());
        }

        if (dto.getLinkedTaskId() != null) {
            Task task = taskRepository.findById(dto.getLinkedTaskId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            issue.setLinkedTask(task);
        }

        return toDTO(issueRepository.save(issue));
    }

    @Transactional
    public IssueCommentDTO addComment(Long issueId, String commentText, Long userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        IssueComment comment = IssueComment.builder()
                .issue(issue)
                .user(user)
                .commentText(commentText)
                .build();

        IssueComment saved = issueCommentRepository.save(comment);
        return toCommentDTO(saved);
    }

    public List<IssueCommentDTO> getComments(Long issueId) {
        return issueCommentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(this::toCommentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteIssue(Long issueId, Long userId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));
        issueRepository.delete(issue);
    }

    private IssueDTO toDTO(Issue issue) {
        return IssueDTO.builder()
                .issueId(issue.getId())
                .projectId(issue.getProject().getId())
                .reportedBy(issue.getReportedBy().getId())
                .reportedByName(issue.getReportedBy().getEmail())
                .assignedTo(issue.getAssignedTo() != null ? issue.getAssignedTo().getId() : null)
                .assignedToName(issue.getAssignedTo() != null ? issue.getAssignedTo().getEmail() : null)
                .title(issue.getTitle())
                .description(issue.getDescription())
                .issueType(issue.getIssueType())
                .priority(issue.getPriority())
                .status(issue.getStatus())
                .linkedTaskId(issue.getLinkedTask() != null ? issue.getLinkedTask().getId() : null)
                .linkedTaskTitle(issue.getLinkedTask() != null ? issue.getLinkedTask().getTitle() : null)
                .createdAt(issue.getCreatedAt())
                .updatedAt(issue.getUpdatedAt())
                .resolvedAt(issue.getResolvedAt())
                .build();
    }

    private IssueCommentDTO toCommentDTO(IssueComment comment) {
        return IssueCommentDTO.builder()
                .id(comment.getId())
                .issueId(comment.getIssue().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getEmail())
                .commentText(comment.getCommentText())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
