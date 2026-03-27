package com.fyp.model.dto;

import com.fyp.model.enums.IssuePriority;
import com.fyp.model.enums.IssueStatus;
import com.fyp.model.enums.IssueType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueDTO {
    private Long issueId; // Renamed from id

    @NotNull(message = "Project ID is required")
    private Long projectId;

    private Long reportedBy; // Renamed from reportedById
    private String reportedByName;

    private Long assignedTo; // Renamed from assignedToId
    private String assignedToName;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Issue type is required")
    private IssueType issueType;

    private IssuePriority priority;
    private IssueStatus status;

    private Long linkedTaskId;
    private String linkedTaskTitle;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    private List<IssueCommentDTO> comments;
}
