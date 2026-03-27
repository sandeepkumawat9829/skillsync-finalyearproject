package com.fyp.repository;

import com.fyp.model.entity.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findByTaskId(Long taskId);

    List<TimeEntry> findByUserId(Long userId);

    List<TimeEntry> findByUserIdAndWorkDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<TimeEntry> findByTaskIdAndUserId(Long taskId, Long userId);

    @Query("SELECT SUM(t.hoursSpent) FROM TimeEntry t WHERE t.task.id = :taskId")
    BigDecimal sumHoursByTaskId(Long taskId);

    @Query("SELECT SUM(t.hoursSpent) FROM TimeEntry t WHERE t.user.id = :userId AND t.workDate BETWEEN :startDate AND :endDate")
    BigDecimal sumHoursByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(t.hoursSpent) FROM TimeEntry t WHERE t.task.project.id = :projectId")
    BigDecimal sumHoursByProjectId(Long projectId);
}
