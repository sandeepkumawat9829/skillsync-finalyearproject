package com.fyp.repository;

import com.fyp.model.entity.Sprint;
import com.fyp.model.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, Long> {
    List<Sprint> findByProjectIdOrderBySprintNumberDesc(Long projectId);

    Optional<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);

    List<Sprint> findByProjectId(Long projectId);

    boolean existsByProjectIdAndStatus(Long projectId, SprintStatus status);

    Optional<Sprint> findTopByProjectIdOrderBySprintNumberDesc(Long projectId);
}
