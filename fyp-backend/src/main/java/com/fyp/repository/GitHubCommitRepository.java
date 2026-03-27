package com.fyp.repository;

import com.fyp.model.entity.GitHubCommit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GitHubCommitRepository extends JpaRepository<GitHubCommit, Long> {

    List<GitHubCommit> findByProjectIdOrderByCommittedAtDesc(Long projectId);

    Page<GitHubCommit> findByProjectIdOrderByCommittedAtDesc(Long projectId, Pageable pageable);

    Optional<GitHubCommit> findByProjectIdAndCommitHash(Long projectId, String commitHash);

    boolean existsByProjectIdAndCommitHash(Long projectId, String commitHash);

    @Query("SELECT COUNT(gc) FROM GitHubCommit gc WHERE gc.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT SUM(gc.linesAdded) FROM GitHubCommit gc WHERE gc.project.id = :projectId")
    Long sumLinesAddedByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT SUM(gc.linesDeleted) FROM GitHubCommit gc WHERE gc.project.id = :projectId")
    Long sumLinesDeletedByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT gc FROM GitHubCommit gc WHERE gc.project.id = :projectId AND gc.committedAt >= :since ORDER BY gc.committedAt DESC")
    List<GitHubCommit> findRecentCommits(@Param("projectId") Long projectId, @Param("since") LocalDateTime since);

    @Query("SELECT gc.authorEmail, COUNT(gc) FROM GitHubCommit gc WHERE gc.project.id = :projectId GROUP BY gc.authorEmail ORDER BY COUNT(gc) DESC")
    List<Object[]> countCommitsByAuthor(@Param("projectId") Long projectId);
}
