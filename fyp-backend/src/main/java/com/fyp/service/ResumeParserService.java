package com.fyp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fyp.model.dto.ParsedProfileDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for parsing resumes using PDF text extraction and Gemini AI
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeParserService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final Cloudinary cloudinary;

    /**
     * Parse a resume file (PDF) and extract profile information using Gemini AI
     */
    public ParsedProfileDTO parseResume(MultipartFile file) throws IOException {
        // 1. Extract text from PDF
        String extractedText = extractTextFromPdf(file);

        if (extractedText == null || extractedText.trim().isEmpty()) {
            throw new RuntimeException("Could not extract text from the uploaded file");
        }

        // 2. Upload resume to Cloudinary
        String resumeUrl = null;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", "resumes"));
            resumeUrl = (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            log.warn("Failed to upload resume to Cloudinary: {}", e.getMessage());
        }

        // 3. Parse with Gemini AI (or fallback to rule-based)
        ParsedProfileDTO result;
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            result = parseWithGemini(extractedText);
        } else {
            log.warn("Gemini API key not configured, using rule-based parsing");
            result = parseWithRules(extractedText);
        }

        // 4. Set resume URL and raw text
        result.setResumeUrl(resumeUrl);
        result.setRawText(extractedText.length() > 500 ? extractedText.substring(0, 500) + "..." : extractedText);

        return result;
    }

    /**
     * Extract text from PDF using Apache PDFBox
     */
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Parse resume text using Gemini AI
     */
    private ParsedProfileDTO parseWithGemini(String resumeText) {
        try {
            String prompt = buildGeminiPrompt(resumeText);

            // Build request body
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))),
                    "generationConfig", Map.of(
                            "temperature", 0.1,
                            "maxOutputTokens", 1024));

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Make API call
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            // Parse response
            return parseGeminiResponse(response.getBody());

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return parseWithRules(resumeText);
        }
    }

    /**
     * Build the prompt for Gemini AI
     */
    private String buildGeminiPrompt(String resumeText) {
        return """
                Extract the following information from this resume. Return ONLY valid JSON with no additional text or markdown:
                {
                  "fullName": "string",
                  "phone": "string or null",
                  "branch": "string like Computer Science, IT, ECE, Mechanical, etc.",
                  "semester": "number 1-8 or null",
                  "cgpa": "number between 0-10 or null",
                  "skills": ["array of technical skills like Java, Python, React, etc."],
                  "bio": "2-3 line professional summary based on resume",
                  "githubUrl": "GitHub URL or null",
                  "linkedinUrl": "LinkedIn URL or null",
                  "portfolioUrl": "portfolio website URL or null",
                  "confidence": "number 0-100 indicating how confident you are in the extraction"
                }

                Resume Text:
                ---
                """
                + resumeText.substring(0, Math.min(resumeText.length(), 3000)) + """
                        ---

                        Return ONLY the JSON object, nothing else.
                        """;
    }

    /**
     * Parse Gemini API response
     */
    private ParsedProfileDTO parseGeminiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                String text = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText();

                // Clean up the response (remove markdown code blocks if present)
                text = text.replaceAll("```json", "").replaceAll("```", "").trim();

                // Parse the JSON
                JsonNode parsed = objectMapper.readTree(text);

                ParsedProfileDTO dto = ParsedProfileDTO.builder()
                        .fullName(getTextOrNull(parsed, "fullName"))
                        .phone(getTextOrNull(parsed, "phone"))
                        .branch(getTextOrNull(parsed, "branch"))
                        .semester(getIntOrNull(parsed, "semester"))
                        .cgpa(getDecimalOrNull(parsed, "cgpa"))
                        .skills(getStringList(parsed, "skills"))
                        .bio(getTextOrNull(parsed, "bio"))
                        .githubUrl(getTextOrNull(parsed, "githubUrl"))
                        .linkedinUrl(getTextOrNull(parsed, "linkedinUrl"))
                        .portfolioUrl(getTextOrNull(parsed, "portfolioUrl"))
                        .confidence(getIntOrNull(parsed, "confidence"))
                        .build();
                // If the model omits "confidence", derive a score from how complete the extraction is
                if (dto.getConfidence() == null) {
                    dto.setConfidence(computeHeuristicConfidenceFromFields(dto, true));
                }
                return dto;
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
        }

        return ParsedProfileDTO.builder().confidence(0).build();
    }

    /**
     * Fallback: Parse resume using simple rules/regex.
     * Confidence is computed dynamically from how many fields were successfully extracted (not a fixed constant).
     */
    private ParsedProfileDTO parseWithRules(String text) {
        ParsedProfileDTO.ParsedProfileDTOBuilder builder = ParsedProfileDTO.builder();

        // Extract email pattern to potentially get name
        String[] lines = text.split("\\n");
        if (lines.length > 0) {
            // First non-empty line is often the name
            for (String line : lines) {
                line = line.trim();
                if (!line.isEmpty() && !line.contains("@") && !line.contains("http") && line.length() < 50) {
                    builder.fullName(line);
                    break;
                }
            }
        }

        // Extract phone
        java.util.regex.Pattern phonePattern = java.util.regex.Pattern.compile("(\\+91[\\s-]?)?[6-9]\\d{9}");
        java.util.regex.Matcher phoneMatcher = phonePattern.matcher(text);
        if (phoneMatcher.find()) {
            builder.phone(phoneMatcher.group().replaceAll("[\\s-]", ""));
        }

        // Extract GitHub URL
        java.util.regex.Pattern githubPattern = java.util.regex.Pattern.compile("github\\.com/[\\w-]+",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher githubMatcher = githubPattern.matcher(text);
        if (githubMatcher.find()) {
            builder.githubUrl("https://" + githubMatcher.group());
        }

        // Extract LinkedIn URL
        java.util.regex.Pattern linkedinPattern = java.util.regex.Pattern.compile("linkedin\\.com/in/[\\w-]+",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher linkedinMatcher = linkedinPattern.matcher(text);
        if (linkedinMatcher.find()) {
            builder.linkedinUrl("https://" + linkedinMatcher.group());
        }

        // Extract common skills
        List<String> skills = new ArrayList<>();
        String[] commonSkills = { "Java", "Python", "JavaScript", "React", "Angular", "Node.js", "Spring Boot",
                "MySQL", "PostgreSQL", "MongoDB", "Docker", "AWS", "Git", "HTML", "CSS", "TypeScript",
                "C++", "C#", ".NET", "PHP", "Laravel", "Django", "Flutter", "Kotlin", "Swift" };

        String lowerText = text.toLowerCase();
        for (String skill : commonSkills) {
            if (lowerText.contains(skill.toLowerCase())) {
                skills.add(skill);
            }
        }
        builder.skills(skills);

        // Extract CGPA
        java.util.regex.Pattern cgpaPattern = java.util.regex.Pattern.compile("(CGPA|GPA)[:\\s]*(\\d+\\.?\\d*)",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher cgpaMatcher = cgpaPattern.matcher(text);
        if (cgpaMatcher.find()) {
            try {
                builder.cgpa(new BigDecimal(cgpaMatcher.group(2)));
            } catch (Exception ignored) {
            }
        }

        // Detect branch from keywords
        if (lowerText.contains("computer science") || lowerText.contains("cse")) {
            builder.branch("Computer Science");
        } else if (lowerText.contains("information technology") || lowerText.contains(" it ")) {
            builder.branch("Information Technology");
        } else if (lowerText.contains("electronics") || lowerText.contains("ece")) {
            builder.branch("Electronics & Communication");
        } else if (lowerText.contains("mechanical")) {
            builder.branch("Mechanical Engineering");
        } else if (lowerText.contains("electrical") || lowerText.contains("eee")) {
            builder.branch("Electrical Engineering");
        }

        ParsedProfileDTO dto = builder.build();
        dto.setConfidence(computeHeuristicConfidenceFromFields(dto, false));
        return dto;
    }

    /**
     * Heuristic 0--100 confidence: weighted count of non-empty extracted fields.
     * When {@code geminiExtraction} is true, caps are relaxed slightly (model-assisted parse).
     * Rule-based-only parses are capped at {@code RULE_BASED_MAX_CONFIDENCE} so UI does not
     * imply LLM-level certainty without Gemini.
     */
    private static final int RULE_BASED_MAX_CONFIDENCE = 82;

    private int computeHeuristicConfidenceFromFields(ParsedProfileDTO d, boolean geminiExtraction) {
        double score = 0;
        if (d.getFullName() != null && !d.getFullName().isBlank()) {
            score += 18;
        }
        if (d.getPhone() != null && !d.getPhone().isBlank()) {
            score += 15;
        }
        if (d.getBranch() != null && !d.getBranch().isBlank()) {
            score += 12;
        }
        if (d.getSemester() != null) {
            score += 6;
        }
        if (d.getCgpa() != null) {
            score += 10;
        }
        if (d.getSkills() != null && !d.getSkills().isEmpty()) {
            score += Math.min(18, 6 + d.getSkills().size() * 2);
        }
        if (d.getBio() != null && !d.getBio().isBlank()) {
            score += 8;
        }
        if (d.getGithubUrl() != null && !d.getGithubUrl().isBlank()) {
            score += 6;
        }
        if (d.getLinkedinUrl() != null && !d.getLinkedinUrl().isBlank()) {
            score += 6;
        }
        if (d.getPortfolioUrl() != null && !d.getPortfolioUrl().isBlank()) {
            score += 5;
        }
        int rounded = (int) Math.round(Math.min(100, score));
        if (!geminiExtraction) {
            rounded = Math.min(rounded, RULE_BASED_MAX_CONFIDENCE);
        }
        return rounded;
    }

    // Helper methods
    private String getTextOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return (value != null && !value.isNull() && !value.asText().equals("null")) ? value.asText() : null;
    }

    private Integer getIntOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return (value != null && !value.isNull() && value.isNumber()) ? value.asInt() : null;
    }

    private BigDecimal getDecimalOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value != null && !value.isNull() && value.isNumber()) {
            return new BigDecimal(value.asText());
        }
        return null;
    }

    private List<String> getStringList(JsonNode node, String field) {
        JsonNode array = node.get(field);
        List<String> result = new ArrayList<>();
        if (array != null && array.isArray()) {
            array.forEach(item -> result.add(item.asText()));
        }
        return result;
    }
}
