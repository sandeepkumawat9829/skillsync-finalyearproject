package com.fyp.controller;

import com.fyp.model.dto.ProjectTemplateDTO;
import com.fyp.service.ProjectTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectTemplateController {

    private final ProjectTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<ProjectTemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/domain/{domain}")
    public ResponseEntity<List<ProjectTemplateDTO>> getTemplatesByDomain(@PathVariable String domain) {
        return ResponseEntity.ok(templateService.getTemplatesByDomain(domain));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<ProjectTemplateDTO> getTemplate(@PathVariable Long templateId) {
        return ResponseEntity.ok(templateService.getTemplate(templateId));
    }

    @PostMapping
    public ResponseEntity<ProjectTemplateDTO> createTemplate(@RequestBody ProjectTemplateDTO dto) {
        return ResponseEntity.ok(templateService.createTemplate(dto));
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<ProjectTemplateDTO> updateTemplate(
            @PathVariable Long templateId,
            @RequestBody ProjectTemplateDTO dto) {
        return ResponseEntity.ok(templateService.updateTemplate(templateId, dto));
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deactivateTemplate(@PathVariable Long templateId) {
        templateService.deactivateTemplate(templateId);
        return ResponseEntity.noContent().build();
    }
}
