package com.fyp.controller;

import com.fyp.model.dto.CreateProjectRequest;
import com.fyp.model.dto.ProjectDTO;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.ProjectService;
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

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management APIs")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new project", description = "Create a new FYP project")
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ProjectDTO project = projectService.createProject(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ProjectDTO> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(projectService.getProject(id, userId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my projects")
    public ResponseEntity<List<ProjectDTO>> getMyProjects(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(projectService.getMyProjects(userId));
    }

    @GetMapping("/public")
    @Operation(summary = "Get all public projects (abstract only)")
    public ResponseEntity<List<ProjectDTO>> getPublicProjects() {
        return ResponseEntity.ok(projectService.getPublicProjects());
    }

    @GetMapping("/buckets")
    @Operation(summary = "Get project buckets for college view")
    public ResponseEntity<List<com.fyp.model.dto.CollegeProjectBucketDTO>> getProjectBuckets() {
        return ResponseEntity.ok(projectService.getProjectBuckets());
    }

    @GetMapping
    @Operation(summary = "Get all projects (admin)")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get projects by status")
    public ResponseEntity<List<ProjectDTO>> getProjectsByStatus(@PathVariable com.fyp.model.enums.ProjectStatus status) {
        return ResponseEntity.ok(projectService.getProjectsByStatus(status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a project")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(projectService.updateProject(id, request, userId));
    }

    @GetMapping("/test-mapping")
    @Operation(summary = "Test project mapping without auth")
    public ResponseEntity<List<ProjectDTO>> testMapping() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
