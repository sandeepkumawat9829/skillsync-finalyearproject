package com.fyp.repository;

import com.fyp.model.entity.MentorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorAssignmentRepository extends JpaRepository<MentorAssignment, Long> {
    Optional<MentorAssignment> findByTeamId(Long teamId);

    List<MentorAssignment> findByMentorId(Long mentorId);
}
