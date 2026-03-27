package com.fyp.model.dto;

import com.fyp.model.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long taskId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String status;
    private Integer position;
    private TaskPriority priority;

    private Long projectId;
    private String projectTitle;
    private Long sprintId;

    private Long teamId; // New field

    private Long assignedTo; // Renamed from assignedToId
    private String assignedToName;

    private Long createdBy; // New field
    private String createdByName; // New field

    private LocalDateTime dueDate;
    private LocalDateTime completedAt; // New field

    private Integer estimatedHours;
    private Integer actualHours;

    private java.util.List<String> tags; // New field

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
