package com.fyp.controller;

import com.fyp.model.dto.GitHubCommitDTO;
import com.fyp.model.dto.GitHubStatsDTO;
import com.fyp.service.GitHubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
public class GitHubController {

    private final GitHubService gitHubService;

    /**
     * Sync commits from GitHub for a project
     */
    @PostMapping("/projects/{projectId}/sync")
    public ResponseEntity<Map<String, Object>> syncCommits(@PathVariable Long projectId) {
        int newCommits = gitHubService.syncCommits(projectId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "newCommitsCount", newCommits,
                "message", "Synced " + newCommits + " new commits"));
    }

    /**
     * Get GitHub statistics for a project
     */
    @GetMapping("/projects/{projectId}/stats")
    public ResponseEntity<GitHubStatsDTO> getStats(@PathVariable Long projectId) {
        GitHubStatsDTO stats = gitHubService.getProjectStats(projectId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get commits for a project (paginated)
     */
    @GetMapping("/projects/{projectId}/commits")
    public ResponseEntity<List<GitHubCommitDTO>> getCommits(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<GitHubCommitDTO> commits = gitHubService.getProjectCommits(projectId, page, size);
        return ResponseEntity.ok(commits);
    }
}
