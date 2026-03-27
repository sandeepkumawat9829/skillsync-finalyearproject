package com.fyp.repository;

import com.fyp.model.entity.Project;
import com.fyp.model.enums.ProjectStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCreatedById(Long userId);

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByVisibility(String visibility);

    List<Project> findByDomain(String domain);

    /**
     * Optimized query to fetch projects with related data in a single query.
     * Solves N+1 query problem by using JOIN FETCH.
     */
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.createdBy cb " +
            "LEFT JOIN FETCH p.team t " +
            "LEFT JOIN FETCH t.members " +
            "WHERE p.visibility = :visibility")
    List<Project> findByVisibilityWithDetails(@Param("visibility") String visibility);

    /**
     * Fetch all projects with eager loading for performance.
     */
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.createdBy " +
            "LEFT JOIN FETCH p.team")
    List<Project> findAllWithDetails();

    /**
     * Fetch project by ID with all related entities for performance.
     */
    @Query("SELECT p FROM Project p " +
            "LEFT JOIN FETCH p.createdBy " +
            "LEFT JOIN FETCH p.team t " +
            "LEFT JOIN FETCH t.members " +
            "WHERE p.id = :id")
    Optional<Project> findByIdWithDetails(@Param("id") Long id);

    /**
     * Fetch projects by creator with team details.
     */
    @Query("SELECT DISTINCT p FROM Project p " +
            "LEFT JOIN FETCH p.team t " +
            "LEFT JOIN FETCH t.members " +
            "WHERE p.createdBy.id = :userId")
    List<Project> findByCreatedByIdWithDetails(@Param("userId") Long userId);

    /**
     * Pessimistic lock for concurrent access scenarios.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Project p WHERE p.id = :id")
    Optional<Project> findByIdWithLock(@Param("id") Long id);
}
