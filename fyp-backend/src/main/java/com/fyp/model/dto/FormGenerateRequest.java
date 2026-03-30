package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Manual overrides for generated forms.
 * Provides data to populate exact tables in Form 1 and Form 2.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormGenerateRequest {
    private String labCoordinatorName;
    private String projectTrack; // e.g. "R&D", "CONSULTANCY"
    private String briefIntroduction;
    
    // Form 1 lists
    private List<ToolTechPayload> tools;
    private List<ModulePayload> modules;
    
    // Form 2 lists
    private List<MemberRolePayload> memberRoles;
    private String mentorName; 

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ToolTechPayload {
        private String name;
        private String version;
        private String type; // SOFTWARE / HARDWARE
        private String purpose;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ModulePayload {
        private String name;
        private String functionality;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberRolePayload {
        private String memberName; // Just for reference
        private String handlingModule;
        private String activityName;
        private String softDeadline;
        private String hardDeadline;
        private String story;
    }
}

