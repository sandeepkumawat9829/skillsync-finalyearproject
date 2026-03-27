package com.fyp.controller;

import com.fyp.model.dto.MeetingDTO;
import com.fyp.model.entity.User;
import com.fyp.repository.UserRepository;
import com.fyp.service.CalendarService;
import com.fyp.service.MeetingService;
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
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@Tag(name = "Meetings", description = "Meeting scheduling APIs")
@SecurityRequirement(name = "bearerAuth")
public class MeetingController {

    private final MeetingService meetingService;
    private final CalendarService calendarService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Schedule a new meeting")
    public ResponseEntity<MeetingDTO> scheduleMeeting(
            @RequestBody MeetingDTO meeting,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(meetingService.scheduleMeeting(meeting, userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get meeting by ID")
    public ResponseEntity<MeetingDTO> getMeeting(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getMeeting(id));
    }

    @GetMapping("/team/{teamId}")
    @Operation(summary = "Get all meetings for a team")
    public ResponseEntity<List<MeetingDTO>> getMeetingsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(meetingService.getMeetingsByTeam(teamId));
    }

    @GetMapping("/team/{teamId}/upcoming")
    @Operation(summary = "Get upcoming meetings for a team")
    public ResponseEntity<List<MeetingDTO>> getUpcomingMeetings(@PathVariable Long teamId) {
        return ResponseEntity.ok(meetingService.getUpcomingMeetings(teamId));
    }

    @GetMapping("/mentor")
    @Operation(summary = "Get my meetings as mentor")
    public ResponseEntity<List<MeetingDTO>> getMyMeetingsAsMentor(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.getMeetingsByMentor(userId));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming meetings for current user")
    public ResponseEntity<List<MeetingDTO>> getMyUpcomingMeetings(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.getUpcomingMeetingsForUser(userId));
    }

    @GetMapping("/past")
    @Operation(summary = "Get past meetings for current user")
    public ResponseEntity<List<MeetingDTO>> getMyPastMeetings(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.getPastMeetingsForUser(userId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a meeting")
    public ResponseEntity<MeetingDTO> updateMeeting(
            @PathVariable Long id,
            @RequestBody MeetingDTO meeting,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.updateMeeting(id, meeting, userId));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update meeting status")
    public ResponseEntity<MeetingDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.updateMeetingStatus(id, body.get("status"), userId));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Add meeting notes (completes meeting)")
    public ResponseEntity<MeetingDTO> addNotes(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(meetingService.addMeetingNotes(id, body.get("notes"), userId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a meeting")
    public ResponseEntity<Map<String, String>> cancelMeeting(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        meetingService.cancelMeeting(id, userId);
        return ResponseEntity.ok(Map.of("message", "Meeting cancelled"));
    }

    @GetMapping("/{id}/ics")
    @Operation(summary = "Download meeting as ICS calendar file")
    public ResponseEntity<String> downloadIcs(@PathVariable Long id) {
        String icsContent = calendarService.generateIcsFile(id);
        return ResponseEntity.ok()
                .header("Content-Type", "text/calendar")
                .header("Content-Disposition", "attachment; filename=meeting-" + id + ".ics")
                .body(icsContent);
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
