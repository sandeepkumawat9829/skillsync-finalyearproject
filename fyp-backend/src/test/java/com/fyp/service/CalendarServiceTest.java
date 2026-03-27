package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.entity.Meeting;
import com.fyp.repository.MeetingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("CalendarService Tests")
class CalendarServiceTest {

    @Mock
    private MeetingRepository meetingRepository;

    @InjectMocks
    private CalendarService calendarService;

    private Meeting meeting;

    @BeforeEach
    void setUp() {
        meeting = Meeting.builder()
                .id(1L)
                .title("Team Sync")
                .description("Daily Standup")
                .scheduledAt(LocalDateTime.of(2025, 1, 1, 10, 0))
                .durationMinutes(60)
                .location("Meeting Room A")
                .meetingLink("http://meet.google.com/abc")
                .createdAt(LocalDateTime.of(2025, 1, 1, 9, 0))
                .build();
    }

    @Test
    @DisplayName("Generate ICS File - Should return valid ICS content")
    void generateIcsFile_ShouldReturnValidContent() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        String result = calendarService.generateIcsFile(1L);

        assertNotNull(result);
        assertTrue(result.contains("BEGIN:VCALENDAR"));
        assertTrue(result.contains("SUMMARY:Team Sync"));
        assertTrue(result.contains("DESCRIPTION:Daily Standup"));
        assertTrue(result.contains("LOCATION:Meeting Room A"));
        assertTrue(result.contains("DTSTART:20250101T100000"));
        assertTrue(result.contains("DTEND:20250101T110000"));
        assertTrue(result.contains("END:VCALENDAR"));
    }

    @Test
    @DisplayName("Generate ICS File - Should use meeting link if location is missing")
    void generateIcsFile_ShouldUseLinkIfLocationMissing() {
        meeting.setLocation(null);
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        String result = calendarService.generateIcsFile(1L);

        assertTrue(result.contains("LOCATION:http://meet.google.com/abc"));
    }

    @Test
    @DisplayName("Generate ICS File - Should escape special characters")
    void generateIcsFile_ShouldEscapeCharacters() {
        meeting.setTitle("Meeting, with; special chars\n");
        when(meetingRepository.findById(1L)).thenReturn(Optional.of(meeting));

        String result = calendarService.generateIcsFile(1L);

        assertTrue(result.contains("Meeting\\, with\\; special chars\\n"));
    }

    @Test
    @DisplayName("Generate ICS File - Should throw exception if meeting not found")
    void generateIcsFile_ShouldThrowIfNotFound() {
        when(meetingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> calendarService.generateIcsFile(1L));
    }
}
