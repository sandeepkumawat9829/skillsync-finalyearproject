package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentor_specializations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(MentorSpecializationId.class)
public class MentorSpecialization {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;
}
