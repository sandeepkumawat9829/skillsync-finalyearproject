package com.fyp.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillDTO {
    private Long skillId;
    private String skillName;
    private String category;
}
