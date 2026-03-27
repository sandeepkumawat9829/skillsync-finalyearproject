package com.fyp.controller;

import com.fyp.model.dto.PeerReviewDTO;
import com.fyp.model.dto.PeerReviewSummaryDTO;
import com.fyp.repository.UserRepository;
import com.fyp.service.PeerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peer-reviews")
@RequiredArgsConstructor
public class PeerReviewController {

    private final PeerReviewService peerReviewService;
    private final UserRepository userRepository;

    /**
     * Submit a peer review
     */
    @PostMapping
    public ResponseEntity<PeerReviewDTO> submitReview(
            @RequestBody PeerReviewDTO reviewDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        PeerReviewDTO saved = peerReviewService.submitReview(userId, reviewDTO);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get reviews received by the current user for a project
     */
    @GetMapping("/projects/{projectId}/my-feedback")
    public ResponseEntity<List<PeerReviewDTO>> getMyFeedback(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<PeerReviewDTO> reviews = peerReviewService.getReviewsForUserInProject(userId, projectId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get reviews I have submitted
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<List<PeerReviewDTO>> getMySubmittedReviews(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<PeerReviewDTO> reviews = peerReviewService.getReviewsSubmittedByUser(userId);
        return ResponseEntity.ok(reviews);
    }

    /**
     * Get my review summary (aggregated ratings)
     */
    @GetMapping("/my-summary")
    public ResponseEntity<PeerReviewSummaryDTO> getMySummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        PeerReviewSummaryDTO summary = peerReviewService.getUserReviewSummary(userId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get summary for a specific user (for mentor view)
     */
    @GetMapping("/users/{userId}/summary")
    public ResponseEntity<PeerReviewSummaryDTO> getUserSummary(@PathVariable Long userId) {
        PeerReviewSummaryDTO summary = peerReviewService.getUserReviewSummary(userId);
        return ResponseEntity.ok(summary);
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
