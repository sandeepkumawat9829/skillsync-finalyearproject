package com.fyp.service;

import com.fyp.model.dto.ProjectTemplateDTO;
import com.fyp.model.entity.ProjectTemplate;
import com.fyp.repository.ProjectTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectTemplateService {

    private final ProjectTemplateRepository templateRepository;

    public List<ProjectTemplateDTO> getAllTemplates() {
        return templateRepository.findByIsActiveTrueOrderByTemplateNameAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectTemplateDTO> getTemplatesByDomain(String domain) {
        return templateRepository.findByDomainAndIsActiveTrue(domain)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectTemplateDTO getTemplate(Long templateId) {
        ProjectTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        return toDTO(template);
    }

    @Transactional
    public ProjectTemplateDTO createTemplate(ProjectTemplateDTO dto) {
        ProjectTemplate template = ProjectTemplate.builder()
                .templateName(dto.getTemplateName())
                .domain(dto.getDomain())
                .description(dto.getDescription())
                .objectivesTemplate(dto.getObjectivesTemplate())
                .methodologyTemplate(dto.getMethodologyTemplate())
                .expectedOutcomeTemplate(dto.getExpectedOutcomeTemplate())
                .suggestedTechnologies(dto.getSuggestedTechnologies())
                .requiredSkills(dto.getRequiredSkills())
                .isActive(true)
                .build();

        template = templateRepository.save(template);
        return toDTO(template);
    }

    @Transactional
    public ProjectTemplateDTO updateTemplate(Long templateId, ProjectTemplateDTO dto) {
        ProjectTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (dto.getTemplateName() != null)
            template.setTemplateName(dto.getTemplateName());
        if (dto.getDomain() != null)
            template.setDomain(dto.getDomain());
        if (dto.getDescription() != null)
            template.setDescription(dto.getDescription());
        if (dto.getObjectivesTemplate() != null)
            template.setObjectivesTemplate(dto.getObjectivesTemplate());
        if (dto.getMethodologyTemplate() != null)
            template.setMethodologyTemplate(dto.getMethodologyTemplate());
        if (dto.getExpectedOutcomeTemplate() != null)
            template.setExpectedOutcomeTemplate(dto.getExpectedOutcomeTemplate());
        if (dto.getSuggestedTechnologies() != null)
            template.setSuggestedTechnologies(dto.getSuggestedTechnologies());
        if (dto.getRequiredSkills() != null)
            template.setRequiredSkills(dto.getRequiredSkills());

        template = templateRepository.save(template);
        return toDTO(template);
    }

    @Transactional
    public void deactivateTemplate(Long templateId) {
        ProjectTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        template.setIsActive(false);
        templateRepository.save(template);
    }

    private ProjectTemplateDTO toDTO(ProjectTemplate template) {
        return ProjectTemplateDTO.builder()
                .templateId(template.getTemplateId())
                .templateName(template.getTemplateName())
                .domain(template.getDomain())
                .description(template.getDescription())
                .objectivesTemplate(template.getObjectivesTemplate())
                .methodologyTemplate(template.getMethodologyTemplate())
                .expectedOutcomeTemplate(template.getExpectedOutcomeTemplate())
                .suggestedTechnologies(template.getSuggestedTechnologies())
                .requiredSkills(template.getRequiredSkills())
                .isActive(template.getIsActive())
                .build();
    }
}
