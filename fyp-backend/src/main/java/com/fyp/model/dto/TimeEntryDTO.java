package com.fyp.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeEntryDTO {
    private Long id;

    @NotNull(message = "Task ID is required")
    private Long taskId;

    private String taskTitle;
    private Long projectId;
    private String projectTitle;
    private Long userId;
    private String userName;

    @NotNull(message = "Hours spent is required")
    @Positive(message = "Hours must be positive")
    private BigDecimal hoursSpent;

    @NotNull(message = "Work date is required")
    private LocalDate workDate;

    private String description;
    private Boolean billable;
    private LocalDateTime createdAt;
}
