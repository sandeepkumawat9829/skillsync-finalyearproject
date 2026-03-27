package com.fyp.repository;

import com.fyp.model.entity.MentorSpecialization;
import com.fyp.model.entity.MentorSpecializationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MentorSpecializationRepository extends JpaRepository<MentorSpecialization, MentorSpecializationId> {

    @Query("SELECT ms FROM MentorSpecialization ms WHERE ms.mentor.id = :mentorId")
    List<MentorSpecialization> findByMentorId(Long mentorId);

    @Query("SELECT ms FROM MentorSpecialization ms WHERE ms.skill.skillId = :skillId")
    List<MentorSpecialization> findBySkillId(Long skillId);

    @Query("SELECT ms.mentor.id FROM MentorSpecialization ms WHERE ms.skill.skillId IN :skillIds GROUP BY ms.mentor HAVING COUNT(DISTINCT ms.skill.skillId) >= 1")
    List<Long> findMentorsWithAnySkill(List<Long> skillIds);

    void deleteByMentorIdAndSkillSkillId(Long mentorId, Long skillId);
}
