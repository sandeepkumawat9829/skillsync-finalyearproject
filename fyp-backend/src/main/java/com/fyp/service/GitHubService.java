package com.fyp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.GitHubCommitDTO;
import com.fyp.model.dto.GitHubStatsDTO;
import com.fyp.model.entity.GitHubCommit;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.User;
import com.fyp.repository.GitHubCommitRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubService {

    private final GitHubCommitRepository commitRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private static final String GITHUB_API_BASE = "https://api.github.com";
    private static final Pattern GITHUB_URL_PATTERN = Pattern.compile(
            "(?:https?://)?(?:www\\.)?github\\.com/([^/]+)/([^/]+)(?:\\.git)?/?$");

    /**
     * Sync commits from GitHub repository
     */
    @Transactional
    public int syncCommits(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        String repoUrl = project.getGithubRepoUrl();
        if (repoUrl == null || repoUrl.isBlank()) {
            throw new IllegalArgumentException("Project has no GitHub repository URL configured");
        }

        String[] ownerRepo = parseGitHubUrl(repoUrl);
        String owner = ownerRepo[0];
        String repo = ownerRepo[1];

        List<JsonNode> commits = fetchCommitsFromGitHub(owner, repo);
        int newCommitsCount = 0;

        for (JsonNode commitNode : commits) {
            String sha = commitNode.get("sha").asText();

            // Skip if already synced
            if (commitRepository.existsByProjectIdAndCommitHash(projectId, sha)) {
                continue;
            }

            JsonNode commitData = commitNode.get("commit");
            JsonNode authorData = commitData.get("author");
            JsonNode statsData = commitNode.get("stats");

            GitHubCommit commit = GitHubCommit.builder()
                    .project(project)
                    .commitHash(sha)
                    .commitMessage(commitData.get("message").asText())
                    .authorName(authorData.get("name").asText())
                    .authorEmail(authorData.get("email").asText())
                    .committedAt(parseGitHubDate(authorData.get("date").asText()))
                    .linesAdded(statsData != null ? statsData.get("additions").asInt() : 0)
                    .linesDeleted(statsData != null ? statsData.get("deletions").asInt() : 0)
                    .filesChanged(statsData != null ? statsData.get("total").asInt() : 0)
                    .build();

            // Try to match author email to a user
            userRepository.findByEmail(commit.getAuthorEmail())
                    .ifPresent(commit::setCommittedBy);

            commitRepository.save(commit);
            newCommitsCount++;
        }

        log.info("Synced {} new commits for project {}", newCommitsCount, projectId);
        return newCommitsCount;
    }

    /**
     * Get GitHub statistics for a project
     */
    public GitHubStatsDTO getProjectStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        Long totalCommits = commitRepository.countByProjectId(projectId);
        Long linesAdded = commitRepository.sumLinesAddedByProjectId(projectId);
        Long linesDeleted = commitRepository.sumLinesDeletedByProjectId(projectId);

        List<Object[]> authorStats = commitRepository.countCommitsByAuthor(projectId);
        List<GitHubStatsDTO.AuthorStats> topContributors = authorStats.stream()
                .limit(5)
                .map(row -> GitHubStatsDTO.AuthorStats.builder()
                        .authorEmail((String) row[0])
                        .commitCount((Long) row[1])
                        .percentage(totalCommits > 0 ? ((Long) row[1] * 100.0 / totalCommits) : 0)
                        .build())
                .collect(Collectors.toList());

        List<GitHubCommit> recentCommitEntities = commitRepository.findRecentCommits(
                projectId, LocalDateTime.now().minusDays(30));
        List<GitHubCommitDTO> recentCommits = recentCommitEntities.stream()
                .limit(10)
                .map(this::toDTO)
                .collect(Collectors.toList());

        return GitHubStatsDTO.builder()
                .totalCommits(totalCommits != null ? totalCommits : 0L)
                .totalLinesAdded(linesAdded != null ? linesAdded : 0L)
                .totalLinesDeleted(linesDeleted != null ? linesDeleted : 0L)
                .netLinesOfCode((linesAdded != null ? linesAdded : 0L) - (linesDeleted != null ? linesDeleted : 0L))
                .topContributors(topContributors)
                .recentCommits(recentCommits)
                .repositoryUrl(project.getGithubRepoUrl())
                .build();
    }

    /**
     * Get all commits for a project
     */
    public List<GitHubCommitDTO> getProjectCommits(Long projectId, int page, int size) {
        var commits = commitRepository.findByProjectIdOrderByCommittedAtDesc(
                projectId, org.springframework.data.domain.PageRequest.of(page, size));
        return commits.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private String[] parseGitHubUrl(String url) {
        Matcher matcher = GITHUB_URL_PATTERN.matcher(url.trim());
        if (!matcher.matches()) {
            throw new IllegalArgumentException("Invalid GitHub repository URL: " + url);
        }
        return new String[] { matcher.group(1), matcher.group(2).replace(".git", "") };
    }

    private List<JsonNode> fetchCommitsFromGitHub(String owner, String repo) {
        String url = String.format("%s/repos/%s/%s/commits?per_page=100", GITHUB_API_BASE, owner, repo);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github.v3+json");
        headers.set("User-Agent", "FYP-Management-System");

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode commitsArray = objectMapper.readTree(response.getBody());
                List<JsonNode> commits = new ArrayList<>();

                for (JsonNode commit : commitsArray) {
                    // Fetch individual commit for stats
                    String commitUrl = String.format("%s/repos/%s/%s/commits/%s",
                            GITHUB_API_BASE, owner, repo, commit.get("sha").asText());
                    try {
                        ResponseEntity<String> commitResponse = restTemplate.exchange(
                                commitUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);
                        if (commitResponse.getStatusCode() == HttpStatus.OK) {
                            commits.add(objectMapper.readTree(commitResponse.getBody()));
                        }
                    } catch (Exception e) {
                        // If stats fetch fails, add without stats
                        commits.add(commit);
                    }
                }
                return commits;
            }
        } catch (Exception e) {
            log.error("Error fetching commits from GitHub: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch commits from GitHub: " + e.getMessage());
        }

        return Collections.emptyList();
    }

    private LocalDateTime parseGitHubDate(String dateStr) {
        try {
            ZonedDateTime zdt = ZonedDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
            return zdt.toLocalDateTime();
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private GitHubCommitDTO toDTO(GitHubCommit commit) {
        return GitHubCommitDTO.builder()
                .commitId(commit.getId())
                .projectId(commit.getProject().getId())
                .commitHash(commit.getCommitHash())
                .commitMessage(commit.getCommitMessage())
                .authorName(commit.getAuthorName())
                .authorEmail(commit.getAuthorEmail())
                .committedById(commit.getCommittedBy() != null ? commit.getCommittedBy().getId() : null)
                .committedByName(commit.getCommittedBy() != null ? getUserDisplayName(commit.getCommittedBy()) : null)
                .committedAt(commit.getCommittedAt())
                .linesAdded(commit.getLinesAdded())
                .linesDeleted(commit.getLinesDeleted())
                .filesChanged(commit.getFilesChanged())
                .syncedAt(commit.getSyncedAt())
                .build();
    }

    private String getUserDisplayName(User user) {
        if (user.getStudentProfile() != null) {
            return user.getStudentProfile().getFullName();
        } else if (user.getMentorProfile() != null) {
            return user.getMentorProfile().getFullName();
        }
        return user.getEmail();
    }
}
