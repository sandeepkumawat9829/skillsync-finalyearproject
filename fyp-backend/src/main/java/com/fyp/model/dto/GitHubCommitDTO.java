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
public class GitHubCommitDTO {
    private Long commitId;
    private Long projectId;
    private String commitHash;
    private String commitMessage;
    private String authorName;
    private String authorEmail;
    private Long committedById;
    private String committedByName;
    private LocalDateTime committedAt;
    private Integer linesAdded;
    private Integer linesDeleted;
    private Integer filesChanged;
    private LocalDateTime syncedAt;
}
