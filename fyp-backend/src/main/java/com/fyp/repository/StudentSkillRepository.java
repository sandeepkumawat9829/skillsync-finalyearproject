package com.fyp.repository;

import com.fyp.model.entity.StudentSkill;
import com.fyp.model.entity.StudentSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, StudentSkillId> {

    @Query("SELECT ss FROM StudentSkill ss WHERE ss.student.id = :studentId")
    List<StudentSkill> findByStudentId(Long studentId);

    @Query("SELECT ss FROM StudentSkill ss WHERE ss.skill.skillId = :skillId")
    List<StudentSkill> findBySkillId(Long skillId);

    @Query("SELECT ss.student.id FROM StudentSkill ss WHERE ss.skill.skillId IN :skillIds GROUP BY ss.student HAVING COUNT(DISTINCT ss.skill.skillId) = :skillCount")
    List<Long> findStudentsWithAllSkills(List<Long> skillIds, Long skillCount);

    void deleteByStudentIdAndSkillSkillId(Long studentId, Long skillId);
}
