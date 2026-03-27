package com.fyp.controller;

import com.fyp.model.dto.TimeEntryDTO;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.TimeTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/time-entries")
@RequiredArgsConstructor
@Tag(name = "Time Tracking", description = "Time entry and tracking APIs")
@SecurityRequirement(name = "bearerAuth")
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Log time for a task")
    public ResponseEntity<TimeEntryDTO> logTime(
            @Valid @RequestBody TimeEntryDTO entry,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeTrackingService.logTime(entry, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get time entry by ID")
    public ResponseEntity<TimeEntryDTO> getTimeEntry(@PathVariable Long id) {
        return ResponseEntity.ok(timeTrackingService.getTimeEntry(id));
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get all time entries for a task")
    public ResponseEntity<List<TimeEntryDTO>> getEntriesByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(timeTrackingService.getEntriesByTask(taskId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my time entries")
    public ResponseEntity<List<TimeEntryDTO>> getMyEntries(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(timeTrackingService.getEntriesByUser(userId));
    }

    @GetMapping("/my/this-week")
    @Operation(summary = "Get my time entries for this week")
    public ResponseEntity<List<TimeEntryDTO>> getThisWeekEntries(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(timeTrackingService.getThisWeekEntries(userId));
    }

    @GetMapping("/my/range")
    @Operation(summary = "Get my time entries for a date range")
    public ResponseEntity<List<TimeEntryDTO>> getEntriesByDateRange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(timeTrackingService.getEntriesByUserAndDateRange(userId, startDate, endDate));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a time entry")
    public ResponseEntity<TimeEntryDTO> updateTimeEntry(
            @PathVariable Long id,
            @RequestBody TimeEntryDTO entry,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(timeTrackingService.updateTimeEntry(id, entry, userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a time entry")
    public ResponseEntity<Void> deleteTimeEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        timeTrackingService.deleteTimeEntry(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/{taskId}/total")
    @Operation(summary = "Get total hours logged for a task")
    public ResponseEntity<Map<String, BigDecimal>> getTotalHoursForTask(@PathVariable Long taskId) {
        BigDecimal hours = timeTrackingService.getTotalHoursForTask(taskId);
        return ResponseEntity.ok(Map.of("totalHours", hours));
    }

    @GetMapping("/project/{projectId}/total")
    @Operation(summary = "Get total hours logged for a project")
    public ResponseEntity<Map<String, BigDecimal>> getTotalHoursForProject(@PathVariable Long projectId) {
        BigDecimal hours = timeTrackingService.getTotalHoursForProject(projectId);
        return ResponseEntity.ok(Map.of("totalHours", hours));
    }

    @GetMapping("/my/this-week/total")
    @Operation(summary = "Get my total hours for this week")
    public ResponseEntity<Map<String, BigDecimal>> getMyWeeklyTotal(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        BigDecimal hours = timeTrackingService.getTotalHoursForUserThisWeek(userId);
        return ResponseEntity.ok(Map.of("totalHours", hours));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
