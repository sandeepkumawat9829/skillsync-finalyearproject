package com.fyp.controller;

import com.fyp.model.dto.SprintDTO;
import com.fyp.service.SprintService;
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
@RequestMapping("/api/sprints")
@RequiredArgsConstructor
@Tag(name = "Sprints", description = "Agile sprint management APIs")
@SecurityRequirement(name = "bearerAuth")
public class SprintController {

    private final SprintService sprintService;

    @PostMapping
    @Operation(summary = "Create a new sprint")
    public ResponseEntity<SprintDTO> createSprint(
            @Valid @RequestBody SprintDTO sprint,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sprintService.createSprint(sprint, userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sprint by ID")
    public ResponseEntity<SprintDTO> getSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.getSprint(id));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all sprints for a project")
    public ResponseEntity<List<SprintDTO>> getSprintsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProject(projectId));
    }

    @GetMapping("/project/{projectId}/active")
    @Operation(summary = "Get active sprint for a project")
    public ResponseEntity<SprintDTO> getActiveSprint(@PathVariable Long projectId) {
        SprintDTO sprint = sprintService.getActiveSprint(projectId);
        if (sprint == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sprint);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a sprint")
    public ResponseEntity<SprintDTO> updateSprint(
            @PathVariable Long id,
            @RequestBody SprintDTO sprint) {
        return ResponseEntity.ok(sprintService.updateSprint(id, sprint));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a planned sprint")
    public ResponseEntity<SprintDTO> startSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.startSprint(id));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete an active sprint")
    public ResponseEntity<SprintDTO> completeSprint(@PathVariable Long id) {
        return ResponseEntity.ok(sprintService.completeSprint(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a sprint")
    public ResponseEntity<Void> deleteSprint(@PathVariable Long id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }
}
