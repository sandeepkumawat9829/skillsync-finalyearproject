package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.entity.Meeting;
import com.fyp.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final MeetingRepository meetingRepository;

    private static final DateTimeFormatter ICS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    /**
     * Generate ICS calendar file content for a meeting
     */
    public String generateIcsFile(Long meetingId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting not found"));

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//FYP Management System//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");

        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:meeting-").append(meeting.getId()).append("@fyp-system\r\n");
        ics.append("DTSTAMP:").append(ICS_DATE_FORMAT.format(meeting.getCreatedAt())).append("\r\n");
        ics.append("DTSTART:").append(ICS_DATE_FORMAT.format(meeting.getScheduledAt())).append("\r\n");

        // Calculate end time
        int duration = meeting.getDurationMinutes() != null ? meeting.getDurationMinutes() : 60;
        ics.append("DTEND:").append(ICS_DATE_FORMAT.format(meeting.getScheduledAt().plusMinutes(duration)))
                .append("\r\n");

        ics.append("SUMMARY:").append(escapeIcsText(meeting.getTitle())).append("\r\n");

        if (meeting.getDescription() != null) {
            ics.append("DESCRIPTION:").append(escapeIcsText(meeting.getDescription())).append("\r\n");
        }

        if (meeting.getLocation() != null) {
            ics.append("LOCATION:").append(escapeIcsText(meeting.getLocation())).append("\r\n");
        } else if (meeting.getMeetingLink() != null) {
            ics.append("LOCATION:").append(escapeIcsText(meeting.getMeetingLink())).append("\r\n");
        }

        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");

        return ics.toString();
    }

    /**
     * Escape text for ICS format
     */
    private String escapeIcsText(String text) {
        if (text == null)
            return "";
        return text
                .replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
