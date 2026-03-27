package com.fyp.controller;

import com.fyp.model.dto.MentorAssignmentDTO;
import com.fyp.model.dto.MentorProfileDTO;
import com.fyp.model.dto.MentorRequestDTO;
import com.fyp.model.entity.MentorAssignment;
import com.fyp.model.entity.MentorProfile;
import com.fyp.model.entity.MentorRequest;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.repository.MentorProfileRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import com.fyp.service.MentorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
@Tag(name = "Mentors", description = "Mentor management APIs")
@SecurityRequirement(name = "bearerAuth")
public class MentorController {

    private final MentorService mentorService;
    private final UserRepository userRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final TeamRepository teamRepository;

    @GetMapping
    @Operation(summary = "Get all mentors")
    public ResponseEntity<List<MentorProfileDTO>> getAllMentors() {
        return ResponseEntity.ok(mentorService.getAllMentors());
    }

    @GetMapping("/available")
    @Operation(summary = "Get available mentors (with capacity)")
    public ResponseEntity<List<MentorProfileDTO>> getAvailableMentors() {
        return ResponseEntity.ok(mentorService.getAvailableMentors());
    }

    @GetMapping("/{mentorUserId}")
    @Operation(summary = "Get mentor by user ID")
    public ResponseEntity<MentorProfileDTO> getMentor(@PathVariable Long mentorUserId) {
        return ResponseEntity.ok(mentorService.getMentor(mentorUserId));
    }

    @PostMapping("/request")
    @Operation(summary = "Send mentor request (team leader only)")
    public ResponseEntity<Map<String, String>> sendMentorRequest(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long requesterId = getUserId(userDetails);

        // Resolve teamId: accept teamId directly or look up from projectId
        Long teamId;
        if (request.get("teamId") != null) {
            teamId = Long.valueOf(request.get("teamId").toString());
        } else if (request.get("projectId") != null) {
            Long projectId = Long.valueOf(request.get("projectId").toString());
            Team team = teamRepository.findByProjectId(projectId)
                    .orElseThrow(() -> new RuntimeException("No team found for this project"));
            teamId = team.getId();
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Either teamId or projectId is required"));
        }

        // Resolve mentorUserId: accept mentorUserId directly or look up from mentorId (profile ID)
        Long mentorUserId;
        if (request.get("mentorUserId") != null) {
            mentorUserId = Long.valueOf(request.get("mentorUserId").toString());
        } else if (request.get("mentorId") != null) {
            Long mentorProfileId = Long.valueOf(request.get("mentorId").toString());
            MentorProfile profile = mentorProfileRepository.findById(mentorProfileId)
                    .orElseThrow(() -> new RuntimeException("Mentor profile not found"));
            mentorUserId = profile.getUser().getId();
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Either mentorUserId or mentorId is required"));
        }

        String message = request.get("message") != null ? request.get("message").toString() : "";

        mentorService.sendMentorRequest(teamId, mentorUserId, requesterId, message);
        return ResponseEntity.ok(Map.of("message", "Mentor request sent successfully"));
    }

    @GetMapping("/requests/all")
    @Operation(summary = "Get all my mentor requests (mentor only)")
    public ResponseEntity<List<MentorRequestDTO>> getAllMyRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Long mentorUserId = getUserId(userDetails);
        return ResponseEntity.ok(mentorService.getAllMyRequests(mentorUserId));
    }

    @GetMapping("/requests/pending")
    @Operation(summary = "Get my pending mentor requests (mentor only)")
    public ResponseEntity<List<MentorRequestDTO>> getMyPendingRequests(@AuthenticationPrincipal UserDetails userDetails) {
        Long mentorUserId = getUserId(userDetails);
        return ResponseEntity.ok(mentorService.getMyPendingRequests(mentorUserId));
    }

    @PostMapping("/requests/{id}/accept")
    @Operation(summary = "Accept mentor request")
    public ResponseEntity<Map<String, String>> acceptRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long mentorUserId = getUserId(userDetails);
        mentorService.acceptMentorRequest(id, mentorUserId);
        return ResponseEntity.ok(Map.of("message", "Mentor request accepted"));
    }

    @PostMapping("/requests/{id}/reject")
    @Operation(summary = "Reject mentor request")
    public ResponseEntity<Map<String, String>> rejectRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long mentorUserId = getUserId(userDetails);
        String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : null;
        if (reason != null && reason.trim().length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rejection reason must be at least 10 characters"));
        }
        mentorService.rejectMentorRequest(id, mentorUserId);
        return ResponseEntity.ok(Map.of("message", "Mentor request rejected"));
    }

    @GetMapping("/assignments")
    @Operation(summary = "Get my mentor assignments (mentor only)")
    public ResponseEntity<List<MentorAssignmentDTO>> getMyAssignments(@AuthenticationPrincipal UserDetails userDetails) {
        Long mentorUserId = getUserId(userDetails);
        return ResponseEntity.ok(mentorService.getMyAssignments(mentorUserId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my mentor profile")
    public ResponseEntity<MentorProfileDTO> updateMyProfile(
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        MentorProfile profile = mentorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        // Server-side validation
        if (updates.containsKey("bio") && updates.get("bio") != null) {
            String bio = updates.get("bio").toString();
            if (bio.length() > 500) {
                return ResponseEntity.badRequest().body(null);
            }
        }
        if (updates.containsKey("maxProjectsAllowed") && updates.get("maxProjectsAllowed") != null) {
            int maxProjects = Integer.parseInt(updates.get("maxProjectsAllowed").toString());
            if (maxProjects < 1 || maxProjects > 20) {
                return ResponseEntity.badRequest().body(null);
            }
        }
        if (updates.containsKey("phone") && updates.get("phone") != null) {
            String phone = updates.get("phone").toString();
            if (!phone.isEmpty() && !phone.matches("^\\+?[\\d\\s\\-()]+$")) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        if (updates.containsKey("designation")) {
            profile.setDesignation((String) updates.get("designation"));
        }
        if (updates.containsKey("department")) {
            profile.setDepartment((String) updates.get("department"));
        }
        if (updates.containsKey("phone")) {
            profile.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("officeLocation")) {
            profile.setOfficeLocation((String) updates.get("officeLocation"));
        }
        if (updates.containsKey("bio")) {
            profile.setBio((String) updates.get("bio"));
        }
        if (updates.containsKey("maxProjectsAllowed") && updates.get("maxProjectsAllowed") != null) {
            profile.setMaxProjectsAllowed(Integer.valueOf(updates.get("maxProjectsAllowed").toString()));
        }

        mentorProfileRepository.save(profile);
        return ResponseEntity.ok(mentorService.getMentor(userId));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
