package com.fyp.controller;

import com.fyp.model.dto.MilestoneDTO;
import com.fyp.service.MilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MilestoneDTO>> getProjectMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getProjectMilestones(projectId));
    }

    @GetMapping("/{milestoneId}")
    public ResponseEntity<MilestoneDTO> getMilestone(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(milestoneService.getMilestone(milestoneId));
    }

    @PostMapping
    public ResponseEntity<MilestoneDTO> createMilestone(@RequestBody MilestoneDTO dto) {
        return ResponseEntity.ok(milestoneService.createMilestone(dto));
    }

    @PutMapping("/{milestoneId}")
    public ResponseEntity<MilestoneDTO> updateMilestone(
            @PathVariable Long milestoneId,
            @RequestBody MilestoneDTO dto) {
        return ResponseEntity.ok(milestoneService.updateMilestone(milestoneId, dto));
    }

    @PostMapping("/{milestoneId}/status")
    public ResponseEntity<MilestoneDTO> updateStatus(
            @PathVariable Long milestoneId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(milestoneService.updateStatus(milestoneId, request.get("status")));
    }

    @PostMapping("/{milestoneId}/complete")
    public ResponseEntity<MilestoneDTO> completeMilestone(@PathVariable Long milestoneId) {
        return ResponseEntity.ok(milestoneService.completeMilestone(milestoneId));
    }

    @PostMapping("/{milestoneId}/review")
    public ResponseEntity<MilestoneDTO> addMentorReview(
            @PathVariable Long milestoneId,
            @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(milestoneService.addMentorReview(milestoneId, request.get("feedback")));
    }

    @GetMapping("/project/{projectId}/overdue")
    public ResponseEntity<List<MilestoneDTO>> getOverdueMilestones(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getOverdueMilestones(projectId));
    }

    @GetMapping("/project/{projectId}/pending-reviews")
    public ResponseEntity<List<MilestoneDTO>> getPendingReviews(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getPendingReviews(projectId));
    }

    @GetMapping("/project/{projectId}/progress")
    public ResponseEntity<Map<String, Double>> getProjectProgress(@PathVariable Long projectId) {
        Double progress = milestoneService.getProjectProgress(projectId);
        return ResponseEntity.ok(Map.of("progress", progress));
    }

    @DeleteMapping("/{milestoneId}")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long milestoneId) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.noContent().build();
    }
}
