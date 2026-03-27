package com.fyp.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBoardReorderItemDTO {
    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Position is required")
    private Integer position;
}
