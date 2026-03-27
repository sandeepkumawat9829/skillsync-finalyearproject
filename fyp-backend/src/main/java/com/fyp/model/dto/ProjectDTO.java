package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long projectId;
    private String title;
    private String abstractText;
    private String fullDescription;
    private String problemStatement;
    private String objectives;
    private String methodology;
    private String expectedOutcome;
    private List<String> technologies;
    private String domain;
    private Long createdById;
    private String createdByName;
    private Boolean isFromBucket;
    private String status;
    private String visibility;
    private String githubRepoUrl;
    private String createdAt;
    private Long teamId;
    private String teamName;
    private String teamStatus;
    private Integer teamMemberCount;
    private Boolean hasMentor;
    private String mentorName;
}
