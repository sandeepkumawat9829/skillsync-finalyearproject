package com.fyp.service;

import com.fyp.model.dto.TimeEntryDTO;
import com.fyp.model.entity.Task;
import com.fyp.model.entity.TimeEntry;
import com.fyp.model.entity.User;
import com.fyp.repository.TaskRepository;
import com.fyp.repository.TimeEntryRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimeTrackingService {

    private final TimeEntryRepository timeEntryRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public TimeEntryDTO logTime(TimeEntryDTO dto, Long userId) {
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeEntry entry = TimeEntry.builder()
                .task(task)
                .user(user)
                .hoursSpent(dto.getHoursSpent())
                .workDate(dto.getWorkDate())
                .description(dto.getDescription())
                .billable(dto.getBillable() != null ? dto.getBillable() : true)
                .build();

        TimeEntry saved = timeEntryRepository.save(entry);

        // Update task's actual hours
        BigDecimal totalHours = timeEntryRepository.sumHoursByTaskId(task.getId());
        if (totalHours != null) {
            task.setActualHours(totalHours);
            taskRepository.save(task);
        }

        return toDTO(saved);
    }

    public TimeEntryDTO getTimeEntry(Long entryId) {
        TimeEntry entry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Time entry not found"));
        return toDTO(entry);
    }

    public List<TimeEntryDTO> getEntriesByTask(Long taskId) {
        return timeEntryRepository.findByTaskId(taskId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TimeEntryDTO> getEntriesByUser(Long userId) {
        return timeEntryRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TimeEntryDTO> getEntriesByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return timeEntryRepository.findByUserIdAndWorkDateBetween(userId, startDate, endDate).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<TimeEntryDTO> getThisWeekEntries(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return getEntriesByUserAndDateRange(userId, startOfWeek, endOfWeek);
    }

    @Transactional
    public TimeEntryDTO updateTimeEntry(Long entryId, TimeEntryDTO dto, Long userId) {
        TimeEntry entry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Time entry not found"));

        // Verify ownership
        if (!entry.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this time entry");
        }

        if (dto.getHoursSpent() != null)
            entry.setHoursSpent(dto.getHoursSpent());
        if (dto.getWorkDate() != null)
            entry.setWorkDate(dto.getWorkDate());
        if (dto.getDescription() != null)
            entry.setDescription(dto.getDescription());
        if (dto.getBillable() != null)
            entry.setBillable(dto.getBillable());

        TimeEntry saved = timeEntryRepository.save(entry);

        // Update task's actual hours
        BigDecimal totalHours = timeEntryRepository.sumHoursByTaskId(entry.getTask().getId());
        if (totalHours != null) {
            entry.getTask().setActualHours(totalHours);
            taskRepository.save(entry.getTask());
        }

        return toDTO(saved);
    }

    @Transactional
    public void deleteTimeEntry(Long entryId, Long userId) {
        TimeEntry entry = timeEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Time entry not found"));

        if (!entry.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this time entry");
        }

        timeEntryRepository.delete(entry);

        // Update task's actual hours
        BigDecimal totalHours = timeEntryRepository.sumHoursByTaskId(entry.getTask().getId());
        entry.getTask().setActualHours(totalHours != null ? totalHours : BigDecimal.ZERO);
        taskRepository.save(entry.getTask());
    }

    public BigDecimal getTotalHoursForTask(Long taskId) {
        BigDecimal hours = timeEntryRepository.sumHoursByTaskId(taskId);
        return hours != null ? hours : BigDecimal.ZERO;
    }

    public BigDecimal getTotalHoursForProject(Long projectId) {
        BigDecimal hours = timeEntryRepository.sumHoursByProjectId(projectId);
        return hours != null ? hours : BigDecimal.ZERO;
    }

    public BigDecimal getTotalHoursForUserThisWeek(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        BigDecimal hours = timeEntryRepository.sumHoursByUserAndDateRange(userId, startOfWeek, endOfWeek);
        return hours != null ? hours : BigDecimal.ZERO;
    }

    private TimeEntryDTO toDTO(TimeEntry entry) {
        return TimeEntryDTO.builder()
                .id(entry.getId())
                .taskId(entry.getTask().getId())
                .taskTitle(entry.getTask().getTitle())
                .projectId(entry.getTask().getProject().getId())
                .projectTitle(entry.getTask().getProject().getTitle())
                .userId(entry.getUser().getId())
                .userName(entry.getUser().getEmail())
                .hoursSpent(entry.getHoursSpent())
                .workDate(entry.getWorkDate())
                .description(entry.getDescription())
                .billable(entry.getBillable())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
