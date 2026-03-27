package com.fyp.controller;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.service.PlagiarismService;
import com.fyp.service.SkillMatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final SkillMatchingService skillMatchingService;
    private final PlagiarismService plagiarismService;

    /**
     * Suggest team members based on project technologies
     */
    @GetMapping("/projects/{projectId}/suggest-members")
    public ResponseEntity<List<StudentProfileDTO>> suggestTeamMembers(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit) {
        List<StudentProfileDTO> suggestions = skillMatchingService.suggestTeamMembers(projectId, limit);
        return ResponseEntity.ok(suggestions);
    }

    /**
     * Check project abstract for plagiarism
     */
    @GetMapping("/projects/{projectId}/plagiarism-check")
    public ResponseEntity<Map<String, Object>> checkPlagiarism(@PathVariable Long projectId) {
        Map<String, Object> result = plagiarismService.checkSimilarity(projectId);
        return ResponseEntity.ok(result);
    }
}
