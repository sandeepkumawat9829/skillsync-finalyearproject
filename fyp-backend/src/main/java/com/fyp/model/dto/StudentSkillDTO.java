package com.fyp.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkillDTO {
    private Long studentId;
    private Long skillId;
    private String skillName;
    private String category;
    private String proficiencyLevel;
}
