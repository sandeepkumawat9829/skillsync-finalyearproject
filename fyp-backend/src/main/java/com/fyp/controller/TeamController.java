package com.fyp.controller;

import com.fyp.model.dto.TeamDTO;
import com.fyp.model.dto.JoinRequestDTO;
import com.fyp.model.dto.StudentMatchDTO;
import com.fyp.model.dto.TeamInvitationDTO;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.RecommendationService;
import com.fyp.service.TeamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
@Tag(name = "Teams", description = "Team management APIs")
@SecurityRequirement(name = "bearerAuth")
public class TeamController {

    private final TeamService teamService;
    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new team")
    public ResponseEntity<TeamDTO> createTeam(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        String teamName = (String) request.get("teamName");
        Long projectId = Long.valueOf(request.get("projectId").toString());
        Integer maxMembers = request.get("maxMembers") != null
                ? Integer.valueOf(request.get("maxMembers").toString())
                : 4;

        TeamDTO team = teamService.createTeam(teamName, projectId, maxMembers, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(team);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get team by ID")
    public ResponseEntity<TeamDTO> getTeam(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getTeam(id, userId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my team")
    public ResponseEntity<TeamDTO> getMyTeam(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        TeamDTO team = teamService.getMyTeam(userId);
        if (team == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(team);
    }

    @GetMapping("/mine")
    @Operation(summary = "Get all my teams (relevant for both students and mentors)")
    public ResponseEntity<List<TeamDTO>> getMyTeams(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getMyTeams(userId));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get team by project ID")
    public ResponseEntity<TeamDTO> getTeamByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getTeamByProject(projectId, userId));
    }

    @GetMapping("/incomplete")
    @Operation(summary = "Get all incomplete teams")
    public ResponseEntity<List<TeamDTO>> getIncompleteTeams() {
        return ResponseEntity.ok(teamService.getIncompleteTeams());
    }

    @DeleteMapping("/{teamId}/members/{memberId}")
    @Operation(summary = "Remove a member from team (team leader only)")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        teamService.removeMember(teamId, memberId, userId);
        return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
    }

    @PostMapping("/{teamId}/invite")
    @Operation(summary = "Invite a student to join team")
    public ResponseEntity<Map<String, String>> inviteMember(
            @PathVariable Long teamId,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long inviterId = getUserId(userDetails);
        Long inviteeId = null;

        // Support lookup by email (preferred) or by userId
        if (request.get("email") != null) {
            String email = request.get("email").toString();
            User invitee = userRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("No user found with email: " + email));
            inviteeId = invitee.getId();
        } else if (request.get("inviteeUserId") != null) {
            inviteeId = Long.valueOf(request.get("inviteeUserId").toString());
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Either email or inviteeUserId is required"));
        }

        String message = request.get("message") != null ? request.get("message").toString() : "";

        teamService.inviteMember(teamId, inviteeId, inviterId, message);
        return ResponseEntity.ok(Map.of("message", "Invitation sent successfully"));
    }

    @GetMapping("/invitations")
    @Operation(summary = "Get my pending invitations")
    public ResponseEntity<List<TeamInvitationDTO>> getMyInvitations(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getMyPendingInvitations(userId));
    }

    @PostMapping("/invitations/{id}/accept")
    @Operation(summary = "Accept a team invitation")
    public ResponseEntity<TeamDTO> acceptInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.acceptInvitation(id, userId));
    }

    @PostMapping("/invitations/{id}/reject")
    @Operation(summary = "Reject a team invitation")
    public ResponseEntity<Map<String, String>> rejectInvitation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        teamService.rejectInvitation(id, userId);
        return ResponseEntity.ok(Map.of("message", "Invitation rejected"));
    }


    @PostMapping("/{teamId}/request-join")
    @Operation(summary = "Request to join a team")
    public ResponseEntity<Map<String, String>> requestToJoin(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        teamService.requestToJoin(teamId, userId);
        return ResponseEntity.ok(Map.of("message", "Join request sent successfully"));
    }

    @GetMapping("/{teamId}/join-requests")
    @Operation(summary = "Get pending join requests for a team (team leader only)")
    public ResponseEntity<List<JoinRequestDTO>> getJoinRequests(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getJoinRequests(teamId, userId));
    }

    @PostMapping("/join-requests/{requestId}/accept")
    @Operation(summary = "Accept a join request (team leader only)")
    public ResponseEntity<Map<String, String>> acceptJoinRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        teamService.acceptJoinRequest(requestId, userId);
        return ResponseEntity.ok(Map.of("message", "Join request accepted"));
    }

    @PostMapping("/join-requests/{requestId}/reject")
    @Operation(summary = "Reject a join request (team leader only)")
    public ResponseEntity<Map<String, String>> rejectJoinRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        teamService.rejectJoinRequest(requestId, userId);
        return ResponseEntity.ok(Map.of("message", "Join request rejected"));
    }

    @GetMapping("/join-requests/sent")
    @Operation(summary = "Get my sent join requests (pending)")
    public ResponseEntity<List<JoinRequestDTO>> getMySentJoinRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(teamService.getMyOutgoingJoinRequests(userId));
    }

    @GetMapping("/{teamId}/recommendations")
    @Operation(summary = "Get AI recommendations for students to invite to the team")
    public ResponseEntity<List<StudentMatchDTO>> getStudentRecommendations(
            @PathVariable Long teamId,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Returns the top matching unassigned students
        return ResponseEntity.ok(recommendationService.recommendStudentsForTeam(teamId));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
