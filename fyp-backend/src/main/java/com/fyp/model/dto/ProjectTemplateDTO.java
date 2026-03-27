package com.fyp.model.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTemplateDTO {
    private Long templateId;
    private String templateName;
    private String domain;
    private String description;
    private String objectivesTemplate;
    private String methodologyTemplate;
    private String expectedOutcomeTemplate;
    private List<String> suggestedTechnologies;
    private List<String> requiredSkills;
    private Boolean isActive;
}
