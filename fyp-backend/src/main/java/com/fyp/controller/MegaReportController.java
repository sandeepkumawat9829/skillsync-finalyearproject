package com.fyp.controller;

import com.fyp.model.dto.MegaReportRequest;
import com.fyp.service.MegaReportExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Slf4j
public class MegaReportController {

    private final MegaReportExportService megaReportExportService;

    @PostMapping("/project/{projectId}/mega-report")
    @PreAuthorize("hasRole('MENTOR') or hasRole('ADMIN') or hasRole('STUDENT')")
    public ResponseEntity<byte[]> exportMegaReport(
            @PathVariable Long projectId,
            @RequestBody MegaReportRequest req) {
        try {
            byte[] pdfBytes = megaReportExportService.generateMegaReport(projectId, req);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Project_" + projectId + "_MegaReport.pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            log.error("Error generating mega report for project {}: {}", projectId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
