package com.fyp.controller;

import com.fyp.model.dto.IssueCommentDTO;
import com.fyp.model.dto.IssueDTO;
import com.fyp.model.entity.User;
import com.fyp.model.enums.IssueStatus;
import com.fyp.repository.UserRepository;
import com.fyp.service.IssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@Tag(name = "Issues", description = "Bug/Issue tracking APIs")
@SecurityRequirement(name = "bearerAuth")
public class IssueController {

    private final IssueService issueService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new issue")
    public ResponseEntity<IssueDTO> createIssue(
            @Valid @RequestBody IssueDTO issue,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(issueService.createIssue(issue, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get issue by ID")
    public ResponseEntity<IssueDTO> getIssue(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssue(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all issues for a project")
    public ResponseEntity<List<IssueDTO>> getIssuesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    @Operation(summary = "Get issues by project and status")
    public ResponseEntity<List<IssueDTO>> getIssuesByStatus(
            @PathVariable Long projectId,
            @PathVariable IssueStatus status) {
        return ResponseEntity.ok(issueService.getIssuesByStatus(projectId, status));
    }

    @GetMapping("/my")
    @Operation(summary = "Get issues assigned to me")
    public ResponseEntity<List<IssueDTO>> getMyIssues(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(issueService.getIssuesByUser(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an issue")
    public ResponseEntity<IssueDTO> updateIssue(
            @PathVariable Long id,
            @RequestBody IssueDTO issue,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(issueService.updateIssue(id, issue, userId));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to an issue")
    public ResponseEntity<IssueCommentDTO> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        String commentText = body.get("commentText");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(issueService.addComment(id, commentText, userId));
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get comments for an issue")
    public ResponseEntity<List<IssueCommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getComments(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an issue")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        issueService.deleteIssue(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
