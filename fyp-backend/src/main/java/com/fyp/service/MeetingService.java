package com.fyp.service;

import com.fyp.model.dto.MeetingDTO;
import com.fyp.model.entity.*;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final StudentProfileRepository studentProfileRepository;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Transactional
    public MeetingDTO scheduleMeeting(MeetingDTO dto, Long schedulerId) {
        Team team = teamRepository.findById(dto.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        User mentor = null;
        if (dto.getMentorId() != null) {
            mentor = userRepository.findById(dto.getMentorId())
                    .orElseThrow(() -> new RuntimeException("Mentor not found"));
        }

        Meeting meeting = Meeting.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .agenda(dto.getAgenda())
                .scheduledAt(dto.getScheduledAt())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 60)
                .meetingLink(dto.getMeetingLink())
                .location(dto.getLocation())
                .meetingType(dto.getMeetingType() != null ? dto.getMeetingType() : "ONLINE")
                .status("SCHEDULED")
                .team(team)
                .mentor(mentor)
                .createdAt(LocalDateTime.now())
                .build();

        Meeting saved = meetingRepository.save(meeting);

        // Notify team members
        team.getMembers().forEach(member -> {
            notificationService.sendNotification(
                    member.getUser().getId(),
                    "MEETING_SCHEDULED",
                    "Meeting scheduled: " + meeting.getTitle() + " at " + meeting.getScheduledAt());
                    
            String memberName = studentProfileRepository.findByUserId(member.getUser().getId())
                    .map(com.fyp.model.entity.StudentProfile::getFullName)
                    .orElse(member.getUser().getEmail());
            String dateStr = meeting.getScheduledAt() != null ? meeting.getScheduledAt().toLocalDate().toString() : "";
            String timeStr = meeting.getScheduledAt() != null ? meeting.getScheduledAt().toLocalTime().toString() : "";
            String link = meeting.getMeetingLink() != null ? meeting.getMeetingLink() : frontendUrl + "/student/meetings";
            emailService.sendMeetingScheduledEmail(
                    member.getUser().getEmail(),
                    memberName,
                    meeting.getTitle(),
                    dateStr,
                    timeStr,
                    link
            );
        });

        // Notify mentor
        if (mentor != null) {
            notificationService.sendNotification(
                    mentor.getId(),
                    "MEETING_SCHEDULED",
                    "Meeting scheduled: " + meeting.getTitle() + " at " + meeting.getScheduledAt());
                    
            String dateStr = meeting.getScheduledAt() != null ? meeting.getScheduledAt().toLocalDate().toString() : "";
            String timeStr = meeting.getScheduledAt() != null ? meeting.getScheduledAt().toLocalTime().toString() : "";
            String link = meeting.getMeetingLink() != null ? meeting.getMeetingLink() : frontendUrl + "/mentor/meetings";
            emailService.sendMeetingScheduledEmail(
                    mentor.getEmail(),
                    mentor.getEmail(),
                    meeting.getTitle(),
                    dateStr,
                    timeStr,
                    link
            );
        }

        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public MeetingDTO getMeeting(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        return toDTO(meeting);
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByTeam(Long teamId) {
        return meetingRepository.findByTeamId(teamId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getMeetingsByMentor(Long mentorId) {
        return meetingRepository.findByMentorId(mentorId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getUpcomingMeetings(Long teamId) {
        return meetingRepository.findByTeamIdAndScheduledAtAfter(teamId, LocalDateTime.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getUpcomingMeetingsForUser(Long userId) {
        return meetingRepository.findUpcomingMeetingsForUser(userId, LocalDateTime.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> getPastMeetingsForUser(Long userId) {
        return meetingRepository.findPastMeetingsForUser(userId, LocalDateTime.now()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MeetingDTO updateMeeting(Long meetingId, MeetingDTO dto, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        if (dto.getTitle() != null)
            meeting.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            meeting.setDescription(dto.getDescription());
        if (dto.getAgenda() != null)
            meeting.setAgenda(dto.getAgenda());
        if (dto.getScheduledAt() != null)
            meeting.setScheduledAt(dto.getScheduledAt());
        if (dto.getDurationMinutes() != null)
            meeting.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getMeetingLink() != null)
            meeting.setMeetingLink(dto.getMeetingLink());
        if (dto.getLocation() != null)
            meeting.setLocation(dto.getLocation());
        if (dto.getMeetingType() != null)
            meeting.setMeetingType(dto.getMeetingType());
        if (dto.getNotes() != null)
            meeting.setNotes(dto.getNotes());

        return toDTO(meetingRepository.save(meeting));
    }

    @Transactional
    public MeetingDTO updateMeetingStatus(Long meetingId, String status, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setStatus(status);
        return toDTO(meetingRepository.save(meeting));
    }

    @Transactional
    public MeetingDTO addMeetingNotes(Long meetingId, String notes, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setNotes(notes);
        meeting.setStatus("COMPLETED");
        return toDTO(meetingRepository.save(meeting));
    }

    @Transactional
    public void cancelMeeting(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        meeting.setStatus("CANCELLED");
        meetingRepository.save(meeting);

        // Notify team members
        meeting.getTeam().getMembers().forEach(member -> {
            notificationService.sendNotification(
                    member.getUser().getId(),
                    "MEETING_CANCELLED",
                    "Meeting cancelled: " + meeting.getTitle());
        });
    }

    private MeetingDTO toDTO(Meeting meeting) {
        List<String> attendeeNames = meeting.getTeam().getMembers().stream()
                .map(m -> m.getUser().getEmail())
                .collect(Collectors.toList());

        return MeetingDTO.builder()
                .id(meeting.getId())
                .title(meeting.getTitle())
                .description(meeting.getDescription())
                .agenda(meeting.getAgenda())
                .scheduledAt(meeting.getScheduledAt())
                .durationMinutes(meeting.getDurationMinutes())
                .meetingLink(meeting.getMeetingLink())
                .location(meeting.getLocation())
                .meetingType(meeting.getMeetingType())
                .status(meeting.getStatus())
                .projectId(meeting.getTeam().getProject() != null ? meeting.getTeam().getProject().getId() : null)
                .projectTitle(meeting.getTeam().getProject() != null ? meeting.getTeam().getProject().getTitle() : null)
                .teamId(meeting.getTeam().getId())
                .teamName(meeting.getTeam().getTeamName())
                .mentorId(meeting.getMentor() != null ? meeting.getMentor().getId() : null)
                .mentorName(meeting.getMentor() != null ? meeting.getMentor().getEmail() : null)
                .attendeeNames(attendeeNames)
                .notes(meeting.getNotes())
                .createdAt(meeting.getCreatedAt())
                .build();
    }
}
