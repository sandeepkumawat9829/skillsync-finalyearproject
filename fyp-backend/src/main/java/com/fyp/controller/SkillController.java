package com.fyp.controller;

import com.fyp.model.dto.SkillAnalyticsDTO;
import com.fyp.model.dto.SkillDTO;
import com.fyp.model.dto.StudentSkillDTO;
import com.fyp.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SkillController {

    private final SkillService skillService;

    // Skill catalog endpoints
    @GetMapping
    public ResponseEntity<List<SkillDTO>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(skillService.getCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SkillDTO>> getSkillsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(skillService.getSkillsByCategory(category));
    }

    @GetMapping("/{skillId}")
    public ResponseEntity<SkillDTO> getSkill(@PathVariable Long skillId) {
        return ResponseEntity.ok(skillService.getSkill(skillId));
    }

    @PostMapping
    public ResponseEntity<SkillDTO> createSkill(@RequestBody SkillDTO dto) {
        return ResponseEntity.ok(skillService.createSkill(dto));
    }

    // Student skill endpoints
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentSkillDTO>> getStudentSkills(@PathVariable Long studentId) {
        return ResponseEntity.ok(skillService.getStudentSkills(studentId));
    }

    @PostMapping("/student/{studentId}")
    public ResponseEntity<StudentSkillDTO> addStudentSkill(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> request) {
        Long skillId = Long.valueOf(request.get("skillId").toString());
        String proficiency = (String) request.get("proficiencyLevel");
        return ResponseEntity.ok(skillService.addStudentSkill(studentId, skillId, proficiency));
    }

    @DeleteMapping("/student/{studentId}/skill/{skillId}")
    public ResponseEntity<Void> removeStudentSkill(
            @PathVariable Long studentId,
            @PathVariable Long skillId) {
        skillService.removeStudentSkill(studentId, skillId);
        return ResponseEntity.noContent().build();
    }

    // Mentor specialization endpoints
    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<SkillDTO>> getMentorSpecializations(@PathVariable Long mentorId) {
        return ResponseEntity.ok(skillService.getMentorSpecializations(mentorId));
    }

    @PostMapping("/mentor/{mentorId}/skill/{skillId}")
    public ResponseEntity<Void> addMentorSpecialization(
            @PathVariable Long mentorId,
            @PathVariable Long skillId) {
        skillService.addMentorSpecialization(mentorId, skillId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/mentor/{mentorId}/skill/{skillId}")
    public ResponseEntity<Void> removeMentorSpecialization(
            @PathVariable Long mentorId,
            @PathVariable Long skillId) {
        skillService.removeMentorSpecialization(mentorId, skillId);
        return ResponseEntity.noContent().build();
    }

    // Search endpoints
    @PostMapping("/search/students")
    public ResponseEntity<List<Long>> findStudentsWithSkills(@RequestBody List<Long> skillIds) {
        return ResponseEntity.ok(skillService.findStudentsWithSkills(skillIds));
    }

    @PostMapping("/search/mentors")
    public ResponseEntity<List<Long>> findMentorsWithSkills(@RequestBody List<Long> skillIds) {
        return ResponseEntity.ok(skillService.findMentorsWithSkills(skillIds));
    }

    // Team skill analytics for radar chart visualization
    @GetMapping("/teams/{teamId}/skill-graph")
    @Operation(summary = "Get team skill analytics for radar chart visualization")
    public ResponseEntity<SkillAnalyticsDTO> getTeamSkillGraph(@PathVariable Long teamId) {
        return ResponseEntity.ok(skillService.getTeamSkillAnalytics(teamId));
    }
}
