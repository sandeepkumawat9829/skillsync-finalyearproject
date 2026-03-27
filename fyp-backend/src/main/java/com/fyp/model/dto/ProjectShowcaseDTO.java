package com.fyp.model.dto;

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
public class ProjectShowcaseDTO {
    private Long showcaseId;
    private Long projectId;
    private String projectTitle;
    private String projectAbstract;
    private String teamName;
    private List<String> teamMembers;
    private String mentorName;
    private Boolean isPublished;
    private String academicYear;
    private String demoVideoUrl;
    private String presentationUrl;
    private String liveDemoUrl;
    private String githubUrl;
    private List<String> awards;
    private List<String> tags;
    private List<String> technologies;
    private Integer viewsCount;
    private Integer likesCount;
    private Boolean hasLiked; // Whether current user has liked
    private LocalDateTime publishedAt;
}
