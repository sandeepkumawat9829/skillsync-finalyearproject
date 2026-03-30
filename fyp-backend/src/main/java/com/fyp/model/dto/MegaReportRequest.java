package com.fyp.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MegaReportRequest {
    private String progressChartBase64;
    private String tasksChartBase64;
}
