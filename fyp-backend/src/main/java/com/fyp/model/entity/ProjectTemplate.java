package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "project_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long templateId;

    @Column(nullable = false)
    private String templateName;

    @Column(nullable = false)
    private String domain; // WEB_APP, MOBILE_APP, IOT, AI_ML, BLOCKCHAIN

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String objectivesTemplate;

    @Column(columnDefinition = "TEXT")
    private String methodologyTemplate;

    @Column(columnDefinition = "TEXT")
    private String expectedOutcomeTemplate;

    @ElementCollection
    @CollectionTable(name = "template_technologies", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "technology")
    private List<String> suggestedTechnologies;

    @ElementCollection
    @CollectionTable(name = "template_skills", joinColumns = @JoinColumn(name = "template_id"))
    @Column(name = "skill")
    private List<String> requiredSkills;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
