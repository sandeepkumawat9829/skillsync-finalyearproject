package com.fyp.controller;

import com.fyp.model.dto.SharedResourceDTO;
import com.fyp.repository.UserRepository;
import com.fyp.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final UserRepository userRepository;

    /**
     * Create a shared resource
     */
    @PostMapping
    public ResponseEntity<SharedResourceDTO> createResource(
            @RequestBody SharedResourceDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        SharedResourceDTO saved = resourceService.createResource(userId, dto);
        return ResponseEntity.ok(saved);
    }

    /**
     * Get resources for a team
     */
    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<SharedResourceDTO>> getTeamResources(
            @PathVariable Long teamId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String phase) {
        List<SharedResourceDTO> resources = resourceService.getTeamResources(teamId, type, phase);
        return ResponseEntity.ok(resources);
    }

    /**
     * Delete a resource
     */
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long resourceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        resourceService.deleteResource(resourceId, userId);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
