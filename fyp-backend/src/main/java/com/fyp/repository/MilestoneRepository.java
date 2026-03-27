package com.fyp.repository;

import com.fyp.model.entity.Milestone;
import com.fyp.model.entity.Milestone.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProjectIdOrderByDueDateAsc(Long projectId);

    List<Milestone> findByProjectIdAndStatus(Long projectId, MilestoneStatus status);

    @Query("SELECT m FROM Milestone m WHERE m.project.id = :projectId AND m.dueDate < :now AND m.status != 'COMPLETED'")
    List<Milestone> findOverdueMilestones(Long projectId, LocalDateTime now);

    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.project.id = :projectId AND m.status = 'COMPLETED'")
    Long countCompletedByProject(Long projectId);

    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.project.id = :projectId")
    Long countByProject(Long projectId);

    List<Milestone> findByProjectIdAndReviewedByMentorFalseAndStatus(Long projectId, MilestoneStatus status);
}
