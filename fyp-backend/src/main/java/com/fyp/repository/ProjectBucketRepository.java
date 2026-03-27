package com.fyp.repository;

import com.fyp.model.entity.ProjectBucket;
import com.fyp.model.entity.ProjectBucket.DifficultyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectBucketRepository extends JpaRepository<ProjectBucket, Long> {

    List<ProjectBucket> findByIsAvailableTrueOrderByPostedAtDesc();

    @Query("SELECT b FROM ProjectBucket b WHERE b.isAvailable = true AND b.allocatedTeams < b.maxTeams")
    List<ProjectBucket> findBucketsWithAvailableSlots();

    List<ProjectBucket> findByDepartmentAndIsAvailableTrue(String department);

    List<ProjectBucket> findByDifficultyLevelAndIsAvailableTrue(DifficultyLevel level);

    List<ProjectBucket> findByPostedByIdOrderByPostedAtDesc(Long userId);
}
