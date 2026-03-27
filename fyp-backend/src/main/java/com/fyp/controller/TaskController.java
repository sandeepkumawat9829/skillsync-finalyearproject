package com.fyp.controller;

import com.fyp.model.dto.TaskAssignmentRequest;
import com.fyp.model.dto.TaskBoardReorderItemDTO;
import com.fyp.model.dto.TaskDTO;
import com.fyp.model.dto.TaskMoveRequest;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.TaskService;
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
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task/Kanban management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody TaskDTO task,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(task, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskDTO> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.getTask(id, userId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all tasks for a project (Kanban board)")
    public ResponseEntity<List<TaskDTO>> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, userId));
    }

    @GetMapping("/sprint/{sprintId}")
    @Operation(summary = "Get all tasks for a sprint")
    public ResponseEntity<List<TaskDTO>> getTasksBySprint(
            @PathVariable Long sprintId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.getTasksBySprint(sprintId, userId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get tasks assigned to me")
    public ResponseEntity<List<TaskDTO>> getMyTasks(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    @GetMapping("/project/{projectId}/status/{status}")
    @Operation(summary = "Get tasks by project and status")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(
            @PathVariable Long projectId,
            @PathVariable String status,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.getTasksByStatus(projectId, status, userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO task,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.updateTask(id, task, userId));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move task to a different status (Kanban drag-drop)")
    public ResponseEntity<TaskDTO> moveTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskMoveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.moveTask(id, request.getStatus(), request.getPosition(), userId));
    }

    @PutMapping("/project/{projectId}/reorder")
    @Operation(summary = "Persist kanban ordering for a project")
    public ResponseEntity<List<TaskDTO>> reorderTasks(
            @PathVariable Long projectId,
            @Valid @RequestBody List<TaskBoardReorderItemDTO> updates,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.reorderTasks(projectId, updates, userId));
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "Assign or unassign a task")
    public ResponseEntity<TaskDTO> assignTask(
            @PathVariable Long id,
            @RequestBody TaskAssignmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(taskService.assignTask(id, request, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a task")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
