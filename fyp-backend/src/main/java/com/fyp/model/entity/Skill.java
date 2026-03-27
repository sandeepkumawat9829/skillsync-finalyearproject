package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long skillId;

    @Column(nullable = false, unique = true)
    private String skillName;

    @Enumerated(EnumType.STRING)
    private SkillCategory category;

    public enum SkillCategory {
        FRONTEND, BACKEND, DATABASE, ML, TESTING, DEVOPS, MOBILE, CLOUD, OTHER
    }
}
