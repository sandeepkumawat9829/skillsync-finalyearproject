package com.fyp.controller;

import com.fyp.model.dto.ProjectBucketDTO;
import com.fyp.service.ProjectBucketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buckets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectBucketController {

    private final ProjectBucketService bucketService;

    @GetMapping
    public ResponseEntity<List<ProjectBucketDTO>> getAvailableBuckets() {
        return ResponseEntity.ok(bucketService.getAvailableBuckets());
    }

    @GetMapping("/all")
    public ResponseEntity<List<ProjectBucketDTO>> getAllBuckets() {
        return ResponseEntity.ok(bucketService.getAllBuckets());
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<ProjectBucketDTO>> getBucketsByDepartment(@PathVariable String department) {
        return ResponseEntity.ok(bucketService.getBucketsByDepartment(department));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ProjectBucketDTO>> getBucketsByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(bucketService.getBucketsByDifficulty(difficulty));
    }

    @GetMapping("/{bucketId}")
    public ResponseEntity<ProjectBucketDTO> getBucket(@PathVariable Long bucketId) {
        return ResponseEntity.ok(bucketService.getBucket(bucketId));
    }

    @PostMapping
    public ResponseEntity<ProjectBucketDTO> createBucket(
            @RequestBody ProjectBucketDTO dto,
            @RequestParam Long userId) {
        return ResponseEntity.ok(bucketService.createBucket(dto, userId));
    }

    @PutMapping("/{bucketId}")
    public ResponseEntity<ProjectBucketDTO> updateBucket(
            @PathVariable Long bucketId,
            @RequestBody ProjectBucketDTO dto) {
        return ResponseEntity.ok(bucketService.updateBucket(bucketId, dto));
    }

    @PostMapping("/{bucketId}/allocate")
    public ResponseEntity<ProjectBucketDTO> allocateTeam(@PathVariable Long bucketId) {
        return ResponseEntity.ok(bucketService.allocateTeam(bucketId));
    }

    @DeleteMapping("/{bucketId}")
    public ResponseEntity<Void> deactivateBucket(@PathVariable Long bucketId) {
        bucketService.deactivateBucket(bucketId);
        return ResponseEntity.noContent().build();
    }
}
