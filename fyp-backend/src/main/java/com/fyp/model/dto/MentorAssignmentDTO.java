package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorAssignmentDTO {
    private Long assignmentId;
    private Long teamId;
    private String teamName;
    private Long projectId;
    private String projectTitle;
    private String projectStatus;
    private Integer memberCount;
    private Integer progress;
    private LocalDateTime assignedAt;
    private String status;
}
