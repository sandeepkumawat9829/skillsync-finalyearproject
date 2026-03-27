package com.fyp.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Abstract is required")
    private String abstractText;

    private String fullDescription;
    private String problemStatement;
    private String objectives;
    private String methodology;
    private String expectedOutcome;
    private List<String> technologies;
    private String domain;
    private String visibility;
    private String githubRepoUrl;
    private Boolean fromBucket;
    private Long bucketId;
}
