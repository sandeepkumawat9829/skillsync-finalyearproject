package com.fyp.model.entity;

import java.io.Serializable;
import java.util.Objects;

public class StudentSkillId implements Serializable {
    private Long student;
    private Long skill;

    public StudentSkillId() {
    }

    public StudentSkillId(Long student, Long skill) {
        this.student = student;
        this.skill = skill;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        StudentSkillId that = (StudentSkillId) o;
        return Objects.equals(student, that.student) && Objects.equals(skill, that.skill);
    }

    @Override
    public int hashCode() {
        return Objects.hash(student, skill);
    }
}
