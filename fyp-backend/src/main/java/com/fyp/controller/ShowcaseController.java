package com.fyp.controller;

import com.fyp.model.dto.ProjectShowcaseDTO;
import com.fyp.repository.UserRepository;
import com.fyp.service.ShowcaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/showcase")
@RequiredArgsConstructor
public class ShowcaseController {

    private final ShowcaseService showcaseService;
    private final UserRepository userRepository;

    /**
     * Get public showcase gallery
     */
    @GetMapping
    public ResponseEntity<List<ProjectShowcaseDTO>> getGallery(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "recent") String sortBy,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdOptional(userDetails);
        List<ProjectShowcaseDTO> gallery = showcaseService.getGallery(page, size, sortBy, userId);
        return ResponseEntity.ok(gallery);
    }

    /**
     * Get single showcase details
     */
    @GetMapping("/{showcaseId}")
    public ResponseEntity<ProjectShowcaseDTO> getShowcase(
            @PathVariable Long showcaseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdOptional(userDetails);
        ProjectShowcaseDTO showcase = showcaseService.getShowcase(showcaseId, userId);
        return ResponseEntity.ok(showcase);
    }

    /**
     * Publish a project to showcase
     */
    @PostMapping("/projects/{projectId}/publish")
    public ResponseEntity<ProjectShowcaseDTO> publishProject(
            @PathVariable Long projectId,
            @RequestBody ProjectShowcaseDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ProjectShowcaseDTO showcase = showcaseService.publishProject(projectId, request, userId);
        return ResponseEntity.ok(showcase);
    }

    /**
     * Toggle like on a showcase
     */
    @PostMapping("/{showcaseId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long showcaseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        boolean liked = showcaseService.toggleLike(showcaseId, userId);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    /**
     * Search showcases
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProjectShowcaseDTO>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdOptional(userDetails);
        List<ProjectShowcaseDTO> results = showcaseService.search(q, page, size, userId);
        return ResponseEntity.ok(results);
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    private Long getUserIdOptional(UserDetails userDetails) {
        if (userDetails == null)
            return null;
        return userRepository.findByEmail(userDetails.getUsername())
                .map(user -> user.getId())
                .orElse(null);
    }
}
