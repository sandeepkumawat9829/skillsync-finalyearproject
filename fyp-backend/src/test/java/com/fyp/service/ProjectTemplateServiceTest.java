package com.fyp.service;

import com.fyp.model.dto.ProjectTemplateDTO;
import com.fyp.model.entity.ProjectTemplate;
import com.fyp.repository.ProjectTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectTemplateService Tests")
class ProjectTemplateServiceTest {

    @Mock
    private ProjectTemplateRepository templateRepository;

    @InjectMocks
    private ProjectTemplateService templateService;

    private ProjectTemplate template;

    @BeforeEach
    void setUp() {
        template = ProjectTemplate.builder()
                .templateId(1L)
                .templateName("Web App")
                .domain("Web Development")
                .description("Standard web app")
                .objectivesTemplate("Build a web app")
                .methodologyTemplate("Agile")
                .expectedOutcomeTemplate("Working app")
                .suggestedTechnologies(Arrays.asList("React", "Spring Boot"))
                .requiredSkills(Arrays.asList("Java", "JS"))
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Get All Templates - Should return list")
    void getAllTemplates_ShouldReturnList() {
        when(templateRepository.findByIsActiveTrueOrderByTemplateNameAsc()).thenReturn(Arrays.asList(template));

        List<ProjectTemplateDTO> result = templateService.getAllTemplates();

        assertEquals(1, result.size());
        assertEquals("Web App", result.get(0).getTemplateName());
    }

    @Test
    @DisplayName("Get Templates by Domain - Should return list")
    void getTemplatesByDomain_ShouldReturnList() {
        when(templateRepository.findByDomainAndIsActiveTrue("Web Development")).thenReturn(Arrays.asList(template));

        List<ProjectTemplateDTO> result = templateService.getTemplatesByDomain("Web Development");

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Template - Should return DTO")
    void getTemplate_ShouldReturnDTO() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));

        ProjectTemplateDTO result = templateService.getTemplate(1L);

        assertNotNull(result);
        assertEquals("Web App", result.getTemplateName());
    }

    @Test
    @DisplayName("Create Template - Should save and return DTO")
    void createTemplate_ShouldSave() {
        ProjectTemplateDTO dto = ProjectTemplateDTO.builder()
                .templateName("Web App")
                .domain("Web Development")
                .build();

        when(templateRepository.save(any(ProjectTemplate.class))).thenReturn(template);

        ProjectTemplateDTO result = templateService.createTemplate(dto);

        assertNotNull(result);
        assertEquals("Web App", result.getTemplateName());
    }

    @Test
    @DisplayName("Update Template - Should update allowed fields")
    void updateTemplate_ShouldUpdate() {
        ProjectTemplateDTO dto = ProjectTemplateDTO.builder()
                .templateName("Updated Name")
                .domain("Updated Domain")
                .build();

        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(ProjectTemplate.class))).thenAnswer(i -> i.getArgument(0));

        ProjectTemplateDTO result = templateService.updateTemplate(1L, dto);

        assertEquals("Updated Name", result.getTemplateName());
        assertEquals("Updated Domain", result.getDomain());
    }

    @Test
    @DisplayName("Deactivate Template - Should set active to false")
    void deactivateTemplate_ShouldDeactivate() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(templateRepository.save(any(ProjectTemplate.class))).thenAnswer(i -> i.getArgument(0));

        templateService.deactivateTemplate(1L);

        assertFalse(template.getIsActive());
        verify(templateRepository).save(template);
    }
}
