package com.fyp.controller;

import com.fyp.service.PdfReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "PDF Report Generation APIs")
public class ReportController {

    private final PdfReportService pdfReportService;

    @GetMapping("/project/{projectId}/pdf")
    @Operation(summary = "Generate Project PDF Report", description = "Generates a PDF report for the specified project")
    public ResponseEntity<byte[]> generateProjectReport(@PathVariable Long projectId) {
        byte[] pdfBytes = pdfReportService.generateProjectReport(projectId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=project_report_" + projectId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/team/{teamId}/pdf")
    @Operation(summary = "Generate Team PDF Report", description = "Generates a PDF report for the specified team")
    public ResponseEntity<byte[]> generateTeamReport(@PathVariable Long teamId) {
        byte[] pdfBytes = pdfReportService.generateTeamReport(teamId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=team_report_" + teamId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/student/{userId}/summary")
    @Operation(summary = "Generate Student Summary PDF", description = "Generates a PDF summary report for a student")
    public ResponseEntity<byte[]> generateStudentSummary(@PathVariable Long userId) {
        byte[] pdfBytes = pdfReportService.generateStudentSummary(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=student_summary_" + userId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
