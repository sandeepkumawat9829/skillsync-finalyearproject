package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal manual overrides for generated forms.
 * If a field is null/blank, the system auto-fills it where possible.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormGenerateRequest {
    private String labCoordinatorName;
    private String projectTrack; // e.g. "R&D, STARTUP"
    private String briefIntroduction;
    private String toolsTechnologies; // free text
    private String proposedModules; // free text
    private String roleSpecificationNotes; // free text (Form-2)
    private String mentorName; // Form-2
}

