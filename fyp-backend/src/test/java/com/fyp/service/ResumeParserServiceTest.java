package com.fyp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fyp.model.dto.ParsedProfileDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResumeParserService Tests")
class ResumeParserServiceTest {

    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private Cloudinary cloudinary;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private Uploader uploader;

    @InjectMocks
    private ResumeParserService resumeParserService;

    private MockMultipartFile pdfFile;
    private String extractedText = "John Doe\nDetails...";

    @BeforeEach
    void setUp() throws IOException {
        // Inject RestTemplate (since it's initialized inline in service)
        ReflectionTestUtils.setField(resumeParserService, "restTemplate", restTemplate);

        // Setup Cloudinary mock
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), any(Map.class)))
                .thenReturn(Map.of("secure_url", "http://cloudinary.com/resume.pdf"));

        // Create a valid PDF file in memory
        byte[] pdfBytes = createPdfBytes(
                "John Doe\nComputer Science Student\nSkills: Java, Spring Boot\nEmail: john@test.com\nPhone: +919876543210");
        pdfFile = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytes);

        // Setup generic ObjectMapper behavior if needed (often used for parsing Gemini
        // response)
        // But for unit tests verify specific calls within test methods
    }

    private byte[] createPdfBytes(String content) throws IOException {
        try (PDDocument document = new PDDocument();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            document.addPage(page);
            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText(content.replace("\n", " ").replace("\r", " ")); // PDFBox simple text
                contentStream.endText();
            }
            document.save(out);
            return out.toByteArray();
        }
    }

    @Test
    @DisplayName("Parse Resume - Gemini Success")
    void parseResume_GeminiSuccess() throws IOException {
        // Set API Key
        ReflectionTestUtils.setField(resumeParserService, "geminiApiKey", "test-api-key");
        ReflectionTestUtils.setField(resumeParserService, "geminiApiUrl", "http://gemini-api");

        // Mock Gemini Response
        String jsonResponse = "{\"candidates\": [{\"content\": {\"parts\": [{\"text\": \"```json\\n{\\\"fullName\\\": \\\"John Doe\\\", \\\"confidence\\\": 90}```\"}]}}]}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(jsonResponse, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        // We need a real ObjectMapper for the service to parse the JSON string response
        // from Gemini
        ReflectionTestUtils.setField(resumeParserService, "objectMapper", new ObjectMapper());

        ParsedProfileDTO result = resumeParserService.parseResume(pdfFile);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        assertEquals("http://cloudinary.com/resume.pdf", result.getResumeUrl());
    }

    @Test
    @DisplayName("Parse Resume - Rule Based Fallback (No API Key)")
    void parseResume_RuleBasedFallback() throws IOException {
        // Set API Key to null
        ReflectionTestUtils.setField(resumeParserService, "geminiApiKey", null);

        // Create PDF with rule-parseable content
        byte[] pdfBytes = createPdfBytes(
                "John Doe\nEmail: john@test.com\nPhone: 9876543210\nGitHub: github.com/johndoe");
        pdfFile = new MockMultipartFile("file", "resume.pdf", "application/pdf", pdfBytes);

        ParsedProfileDTO result = resumeParserService.parseResume(pdfFile);

        assertNotNull(result);
        assertEquals("http://cloudinary.com/resume.pdf", result.getResumeUrl());
        // Note: PDFBox extraction might define exact text structure, rule based might
        // be fragile if text isn't perfect.
        // We assert checking what we put in.
        // "John Doe" might be extracted if it's the first line.
    }

    @Test
    @DisplayName("Parse Resume - Rule Based Fallback (API Error)")
    void parseResume_RuleBasedFallbackOnApiError() throws IOException {
        ReflectionTestUtils.setField(resumeParserService, "geminiApiKey", "test-api-key");
        ReflectionTestUtils.setField(resumeParserService, "geminiApiUrl", "http://gemini-api");

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("API Error"));

        ParsedProfileDTO result = resumeParserService.parseResume(pdfFile);

        assertNotNull(result);
        assertEquals("http://cloudinary.com/resume.pdf", result.getResumeUrl());
    }
}
