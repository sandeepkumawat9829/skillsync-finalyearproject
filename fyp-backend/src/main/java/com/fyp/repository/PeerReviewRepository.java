package com.fyp.repository;

import com.fyp.model.entity.PeerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeerReviewRepository extends JpaRepository<PeerReview, Long> {

    List<PeerReview> findByProjectId(Long projectId);

    List<PeerReview> findByReviewerId(Long reviewerId);

    List<PeerReview> findByRevieweeId(Long revieweeId);

    Optional<PeerReview> findByProjectIdAndReviewerIdAndRevieweeId(Long projectId, Long reviewerId, Long revieweeId);

    boolean existsByProjectIdAndReviewerIdAndRevieweeId(Long projectId, Long reviewerId, Long revieweeId);

    @Query("SELECT AVG(pr.technicalSkillsRating) FROM PeerReview pr WHERE pr.reviewee.id = :userId")
    Double getAverageTechnicalSkillsRating(@Param("userId") Long userId);

    @Query("SELECT AVG(pr.communicationRating) FROM PeerReview pr WHERE pr.reviewee.id = :userId")
    Double getAverageCommunicationRating(@Param("userId") Long userId);

    @Query("SELECT AVG(pr.teamworkRating) FROM PeerReview pr WHERE pr.reviewee.id = :userId")
    Double getAverageTeamworkRating(@Param("userId") Long userId);

    @Query("SELECT AVG(pr.problemSolvingRating) FROM PeerReview pr WHERE pr.reviewee.id = :userId")
    Double getAverageProblemSolvingRating(@Param("userId") Long userId);

    @Query("SELECT AVG(pr.overallContributionRating) FROM PeerReview pr WHERE pr.reviewee.id = :userId")
    Double getAverageOverallRating(@Param("userId") Long userId);

    @Query("SELECT pr FROM PeerReview pr WHERE pr.reviewee.id = :userId AND pr.project.id = :projectId")
    List<PeerReview> findFeedbackForUserInProject(@Param("userId") Long userId, @Param("projectId") Long projectId);

    @Query("SELECT COUNT(pr) FROM PeerReview pr WHERE pr.reviewer.id = :userId AND pr.project.id = :projectId")
    Long countReviewsGivenByUserInProject(@Param("userId") Long userId, @Param("projectId") Long projectId);
}
