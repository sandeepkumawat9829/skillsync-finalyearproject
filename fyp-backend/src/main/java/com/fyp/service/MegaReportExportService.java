package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.MegaReportRequest;
import com.fyp.model.entity.Document;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Team;
import com.fyp.repository.DocumentRepository;
import com.fyp.repository.TeamRepository;
import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.utils.PdfMerger;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MegaReportExportService {

    private final TeamRepository teamRepository;
    private final DocumentRepository documentRepository;
    private final com.fyp.repository.ProjectRepository projectRepository;

    public byte[] generateMegaReport(Long projectId, MegaReportRequest req) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        Team team = teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found for project"));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfDocument mergedDoc = new PdfDocument(new PdfWriter(baos));
        PdfMerger merger = new PdfMerger(mergedDoc);

        // 1. Create the Cover / Overview Document
        ByteArrayOutputStream coverBaos = new ByteArrayOutputStream();
        PdfDocument coverPdf = new PdfDocument(new PdfWriter(coverBaos));
        com.itextpdf.layout.Document layoutDoc = new com.itextpdf.layout.Document(coverPdf);

        layoutDoc.add(new Paragraph("CONSOLIDATED TEAM REPORT")
                .setFontSize(24).setBold().setTextAlignment(TextAlignment.CENTER));
        layoutDoc.add(new Paragraph("\n"));
        layoutDoc.add(new Paragraph("Project Title: " + project.getTitle()).setFontSize(16));
        layoutDoc.add(new Paragraph("Team Name: " + team.getTeamName()).setFontSize(14));
        layoutDoc.add(new Paragraph("Domain: " + project.getDomain()).setFontSize(14));
        layoutDoc.add(new Paragraph("\n"));

        // Embed Charts (Base64)
        if (req != null && req.getProgressChartBase64() != null && !req.getProgressChartBase64().isEmpty()) {
            layoutDoc.add(new Paragraph("Progress Overview").setBold().setFontSize(14));
            Image progressChart = decodeBase64ToImage(req.getProgressChartBase64());
            if (progressChart != null) {
                progressChart.setAutoScale(true);
                layoutDoc.add(progressChart);
            }
        }
        
        if (req != null && req.getTasksChartBase64() != null && !req.getTasksChartBase64().isEmpty()) {
            layoutDoc.add(new AreaBreak()); // Start new page for Task Chart
            layoutDoc.add(new Paragraph("Task Completion Status").setBold().setFontSize(14));
            Image taskChart = decodeBase64ToImage(req.getTasksChartBase64());
            if (taskChart != null) {
                taskChart.setAutoScale(true);
                layoutDoc.add(taskChart);
            }
        }

        layoutDoc.close();
        coverPdf.close();

        // Merge Cover Page into mergedDoc
        PdfDocument generatedCover = new PdfDocument(new PdfReader(new ByteArrayInputStream(coverBaos.toByteArray())));
        merger.merge(generatedCover, 1, generatedCover.getNumberOfPages());
        generatedCover.close();

        // 2. Fetch and Merge existing Documents (SRS, Form1, Form2, etc)
        List<Document> docs = documentRepository.findByProjectIdWithDetails(project.getId());
        // Sort documents conditionally (or merge all)
        for (Document doc : docs) {
            if (doc.getFileUrl() != null && doc.getFileUrl().endsWith(".pdf")) {
                try {
                    byte[] pdfBytes = downloadUrlToBytes(doc.getFileUrl());
                    PdfDocument sourcePdf = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)));
                    merger.merge(sourcePdf, 1, sourcePdf.getNumberOfPages());
                    sourcePdf.close();
                    log.info("Successfully merged document: {}", doc.getOriginalFileName());
                } catch (Exception e) {
                    log.error("Failed to merge document: {} - {}", doc.getOriginalFileName(), e.getMessage());
                }
            }
        }

        merger.close();
        mergedDoc.close();

        return baos.toByteArray();
    }

    private Image decodeBase64ToImage(String base64String) {
        try {
            // Strip format specifier prefix e.g. "data:image/png;base64,"
            if (base64String.contains(",")) {
                base64String = base64String.split(",")[1];
            }
            byte[] imageBytes = Base64.getDecoder().decode(base64String);
            ImageData data = ImageDataFactory.create(imageBytes);
            return new Image(data);
        } catch (Exception e) {
            log.error("Failed to decode base64 chart: {}", e.getMessage());
            return null;
        }
    }

    private byte[] downloadUrlToBytes(String urlString) throws Exception {
        URL url = java.net.URI.create(urlString).toURL();
        try (InputStream is = url.openStream();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] chunk = new byte[8192];
            int read;
            while ((read = is.read(chunk)) > 0) {
                bos.write(chunk, 0, read);
            }
            return bos.toByteArray();
        }
    }
}
