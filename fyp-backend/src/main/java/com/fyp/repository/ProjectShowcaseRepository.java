package com.fyp.repository;

import com.fyp.model.entity.ProjectShowcase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectShowcaseRepository extends JpaRepository<ProjectShowcase, Long> {

    Optional<ProjectShowcase> findByProjectId(Long projectId);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true ORDER BY ps.publishedAt DESC")
    Page<ProjectShowcase> findPublished(Pageable pageable);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true ORDER BY ps.likesCount DESC")
    Page<ProjectShowcase> findByMostLiked(Pageable pageable);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true ORDER BY ps.viewsCount DESC")
    Page<ProjectShowcase> findByMostViewed(Pageable pageable);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true AND :tag MEMBER OF ps.tags")
    List<ProjectShowcase> findByTag(@Param("tag") String tag);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true AND ps.academicYear = :year")
    List<ProjectShowcase> findByAcademicYear(@Param("year") String year);

    @Query("SELECT ps FROM ProjectShowcase ps WHERE ps.isPublished = true AND " +
            "(LOWER(ps.project.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(ps.project.abstractText) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ProjectShowcase> search(@Param("query") String query, Pageable pageable);
}
