package com.fyp.repository;

import com.fyp.model.entity.Skill;
import com.fyp.model.entity.Skill.SkillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findBySkillNameIgnoreCase(String skillName);

    List<Skill> findByCategoryOrderBySkillNameAsc(SkillCategory category);

    List<Skill> findAllByOrderBySkillNameAsc();

    List<Skill> findBySkillNameContainingIgnoreCase(String keyword);
}
