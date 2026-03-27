package com.fyp.repository;

import com.fyp.model.entity.TeamInvitation;
import com.fyp.model.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, Long> {
    List<TeamInvitation> findByToUserIdAndStatus(Long userId, InvitationStatus status);

    List<TeamInvitation> findByTeamId(Long teamId);

    List<TeamInvitation> findByFromUserId(Long userId);
}
