package com.fyp.repository;

import com.fyp.model.entity.Team;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByProjectId(Long projectId);

    List<Team> findByTeamLeaderId(Long userId);

    List<Team> findByIsCompleteFalse();

    /**
     * Fetch team with all related entities to avoid N+1 queries.
     */
    @Query("SELECT t FROM Team t " +
            "LEFT JOIN FETCH t.project " +
            "LEFT JOIN FETCH t.teamLeader " +
            "LEFT JOIN FETCH t.members " +
            "WHERE t.id = :id")
    Optional<Team> findByIdWithDetails(@Param("id") Long id);

    /**
     * Pessimistic lock for race condition prevention when adding members.
     * Forces Thread B to wait until Thread A finishes transaction.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findByIdWithLock(@Param("id") Long id);

    /**
     * Fetch incomplete teams with details for performance.
     */
    @Query("SELECT DISTINCT t FROM Team t " +
            "LEFT JOIN FETCH t.project " +
            "LEFT JOIN FETCH t.teamLeader " +
            "LEFT JOIN FETCH t.members " +
            "WHERE t.isComplete = false")
    List<Team> findIncompleteTeamsWithDetails();

    /**
     * Fetch team by project with all members.
     */
    @Query("SELECT t FROM Team t " +
            "LEFT JOIN FETCH t.members " +
            "LEFT JOIN FETCH t.project " +
            "WHERE t.project.id = :projectId")
    Optional<Team> findByProjectIdWithDetails(@Param("projectId") Long projectId);
}
