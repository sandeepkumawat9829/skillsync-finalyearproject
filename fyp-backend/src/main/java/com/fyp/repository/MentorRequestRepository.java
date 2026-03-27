package com.fyp.repository;

import com.fyp.model.entity.MentorRequest;
import com.fyp.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorRequestRepository extends JpaRepository<MentorRequest, Long> {
    List<MentorRequest> findByMentorIdAndStatus(Long mentorId, InvitationStatus status);

    List<MentorRequest> findByTeamId(Long teamId);

    List<MentorRequest> findByMentorId(Long mentorId);
}
