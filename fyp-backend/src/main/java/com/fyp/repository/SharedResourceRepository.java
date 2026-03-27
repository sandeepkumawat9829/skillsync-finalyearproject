package com.fyp.repository;

import com.fyp.model.entity.SharedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedResourceRepository extends JpaRepository<SharedResource, Long> {

    List<SharedResource> findByTeamIdOrderByCreatedAtDesc(Long teamId);

    List<SharedResource> findByTeamIdAndResourceTypeOrderByCreatedAtDesc(Long teamId, String resourceType);

    List<SharedResource> findByTeamIdAndProjectPhaseOrderByCreatedAtDesc(Long teamId, String projectPhase);

    List<SharedResource> findBySharedByIdOrderByCreatedAtDesc(Long userId);
}
