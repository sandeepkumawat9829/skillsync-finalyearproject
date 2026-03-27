package com.fyp.service;

import com.fyp.model.dto.TimeEntryDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Task;
import com.fyp.model.entity.TimeEntry;
import com.fyp.model.entity.User;
import com.fyp.repository.TaskRepository;
import com.fyp.repository.TimeEntryRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TimeTrackingService Tests")
class TimeTrackingServiceTest {

    @Mock
    private TimeEntryRepository timeEntryRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TimeTrackingService timeTrackingService;

    private User user;
    private Project project;
    private Task task;
    private TimeEntry timeEntry;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .build();

        project = Project.builder()
                .id(1L)
                .title("Project 1")
                .build();

        task = Task.builder()
                .id(1L)
                .project(project)
                .title("Task 1")
                .actualHours(BigDecimal.ZERO)
                .build();

        timeEntry = TimeEntry.builder()
                .id(1L)
                .user(user)
                .task(task)
                .hoursSpent(new BigDecimal("2.5"))
                .workDate(LocalDate.now())
                .description("Working on task")
                .billable(true)
                .build();
    }

    @Test
    @DisplayName("Log Time - Should save and return DTO")
    void logTime_ShouldSave() {
        TimeEntryDTO dto = TimeEntryDTO.builder()
                .taskId(1L)
                .hoursSpent(new BigDecimal("2.5"))
                .workDate(LocalDate.now())
                .description("Working on task")
                .build();

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(timeEntryRepository.save(any(TimeEntry.class))).thenReturn(timeEntry);
        when(timeEntryRepository.sumHoursByTaskId(1L)).thenReturn(new BigDecimal("2.5"));

        TimeEntryDTO result = timeTrackingService.logTime(dto, 1L);

        assertNotNull(result);
        assertEquals(new BigDecimal("2.5"), result.getHoursSpent());
        verify(taskRepository).save(any(Task.class)); // Verifies task hours update
    }

    @Test
    @DisplayName("Get Time Entry - Should return DTO")
    void getTimeEntry_ShouldReturnDTO() {
        when(timeEntryRepository.findById(1L)).thenReturn(Optional.of(timeEntry));

        TimeEntryDTO result = timeTrackingService.getTimeEntry(1L);

        assertNotNull(result);
        assertEquals("Working on task", result.getDescription());
    }

    @Test
    @DisplayName("Get Entries by Task - Should return list")
    void getEntriesByTask_ShouldReturnList() {
        when(timeEntryRepository.findByTaskId(1L)).thenReturn(Arrays.asList(timeEntry));

        List<TimeEntryDTO> result = timeTrackingService.getEntriesByTask(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Entries by User - Should return list")
    void getEntriesByUser_ShouldReturnList() {
        when(timeEntryRepository.findByUserId(1L)).thenReturn(Arrays.asList(timeEntry));

        List<TimeEntryDTO> result = timeTrackingService.getEntriesByUser(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Update Time Entry - Should update allowed fields")
    void updateTimeEntry_ShouldUpdate() {
        TimeEntryDTO dto = TimeEntryDTO.builder()
                .hoursSpent(new BigDecimal("3.0"))
                .description("Updated description")
                .build();

        when(timeEntryRepository.findById(1L)).thenReturn(Optional.of(timeEntry));
        when(timeEntryRepository.save(any(TimeEntry.class))).thenAnswer(i -> i.getArgument(0));
        when(timeEntryRepository.sumHoursByTaskId(1L)).thenReturn(new BigDecimal("3.0"));

        TimeEntryDTO result = timeTrackingService.updateTimeEntry(1L, dto, 1L);

        assertEquals(new BigDecimal("3.0"), result.getHoursSpent());
        assertEquals("Updated description", result.getDescription());
    }

    @Test
    @DisplayName("Delete Time Entry - Should delete and update task hours")
    void deleteTimeEntry_ShouldDelete() {
        when(timeEntryRepository.findById(1L)).thenReturn(Optional.of(timeEntry));
        when(timeEntryRepository.sumHoursByTaskId(1L)).thenReturn(BigDecimal.ZERO);

        timeTrackingService.deleteTimeEntry(1L, 1L);

        verify(timeEntryRepository).delete(timeEntry);
        verify(taskRepository).save(task);
    }

    @Test
    @DisplayName("Delete Time Entry - Should throw if unauthorized")
    void deleteTimeEntry_ShouldThrowIfUnauthorized() {
        when(timeEntryRepository.findById(1L)).thenReturn(Optional.of(timeEntry));

        assertThrows(RuntimeException.class, () -> timeTrackingService.deleteTimeEntry(1L, 2L));
    }

    @Test
    @DisplayName("Get Total Hours For Task - Should return hours")
    void getTotalHoursForTask_ShouldReturnHour() {
        when(timeEntryRepository.sumHoursByTaskId(1L)).thenReturn(new BigDecimal("5.0"));

        BigDecimal result = timeTrackingService.getTotalHoursForTask(1L);

        assertEquals(new BigDecimal("5.0"), result);
    }
}
