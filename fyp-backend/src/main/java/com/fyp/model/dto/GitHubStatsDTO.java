package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubStatsDTO {
    private Long totalCommits;
    private Long totalLinesAdded;
    private Long totalLinesDeleted;
    private Long netLinesOfCode;
    private List<AuthorStats> topContributors;
    private List<GitHubCommitDTO> recentCommits;
    private String repositoryUrl;
    private String lastSyncedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorStats {
        private String authorEmail;
        private String authorName;
        private Long commitCount;
        private Double percentage;
    }
}
