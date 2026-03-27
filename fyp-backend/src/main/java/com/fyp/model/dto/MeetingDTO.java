package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDTO {
    private Long id;
    private String title;
    private String description;
    private String agenda;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private String meetingLink;
    private String location;
    private String meetingType;
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

    // Project/Team info
    private Long projectId;
    private String projectTitle;
    private Long teamId;
    private String teamName;

    // Mentor info
    private Long mentorId;
    private String mentorName;

    // Attendees
    private List<String> attendeeNames;

    // Meeting notes
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
