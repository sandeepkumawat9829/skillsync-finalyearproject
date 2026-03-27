package com.fyp.model.entity;

import java.io.Serializable;
import java.util.Objects;

public class MentorSpecializationId implements Serializable {
    private Long mentor;
    private Long skill;

    public MentorSpecializationId() {
    }

    public MentorSpecializationId(Long mentor, Long skill) {
        this.mentor = mentor;
        this.skill = skill;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        MentorSpecializationId that = (MentorSpecializationId) o;
        return Objects.equals(mentor, that.mentor) && Objects.equals(skill, that.skill);
    }

    @Override
    public int hashCode() {
        return Objects.hash(mentor, skill);
    }
}
