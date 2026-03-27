package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.PeerReviewDTO;
import com.fyp.model.dto.PeerReviewSummaryDTO;
import com.fyp.model.entity.*;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PeerReviewService {

    private final PeerReviewRepository peerReviewRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;

    /**
     * Submit a peer review
     */
    @Transactional
    public PeerReviewDTO submitReview(Long reviewerId, PeerReviewDTO reviewDTO) {
        // Validate project exists
        Project project = projectRepository.findById(reviewDTO.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Validate reviewer and reviewee exist
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        User reviewee = userRepository.findById(reviewDTO.getRevieweeId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewee not found"));

        // Check if review already exists
        if (peerReviewRepository.existsByProjectIdAndReviewerIdAndRevieweeId(
                reviewDTO.getProjectId(), reviewerId, reviewDTO.getRevieweeId())) {
            throw new IllegalArgumentException("You have already reviewed this team member for this project");
        }

        // Cannot review yourself
        if (reviewerId.equals(reviewDTO.getRevieweeId())) {
            throw new IllegalArgumentException("You cannot review yourself");
        }

        PeerReview review = PeerReview.builder()
                .project(project)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .technicalSkillsRating(reviewDTO.getTechnicalSkillsRating())
                .communicationRating(reviewDTO.getCommunicationRating())
                .teamworkRating(reviewDTO.getTeamworkRating())
                .problemSolvingRating(reviewDTO.getProblemSolvingRating())
                .overallContributionRating(reviewDTO.getOverallContributionRating())
                .anonymousFeedback(reviewDTO.getAnonymousFeedback())
                .isAnonymous(reviewDTO.getIsAnonymous() != null ? reviewDTO.getIsAnonymous() : true)
                .build();

        PeerReview saved = peerReviewRepository.save(review);
        return toDTO(saved, true); // Hide reviewer info
    }

    /**
     * Get reviews received by a user for a specific project
     */
    public List<PeerReviewDTO> getReviewsForUserInProject(Long userId, Long projectId) {
        List<PeerReview> reviews = peerReviewRepository.findFeedbackForUserInProject(userId, projectId);
        return reviews.stream()
                .map(review -> toDTO(review, review.getIsAnonymous()))
                .collect(Collectors.toList());
    }

    /**
     * Get all reviews submitted by a user
     */
    public List<PeerReviewDTO> getReviewsSubmittedByUser(Long userId) {
        List<PeerReview> reviews = peerReviewRepository.findByReviewerId(userId);
        return reviews.stream()
                .map(review -> toDTO(review, false))
                .collect(Collectors.toList());
    }

    /**
     * Get team members who can be reviewed (for a project)
     */
    public List<TeamMember> getReviewableTeamMembers(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getTeam() == null) {
            return List.of();
        }

        return project.getTeam().getMembers().stream()
                .filter(member -> !member.getUser().getId().equals(userId))
                .collect(Collectors.toList());
    }

    /**
     * Get aggregated review summary for a user
     */
    public PeerReviewSummaryDTO getUserReviewSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<PeerReview> reviews = peerReviewRepository.findByRevieweeId(userId);

        if (reviews.isEmpty()) {
            return PeerReviewSummaryDTO.builder()
                    .userId(userId)
                    .userName(getUserDisplayName(user))
                    .totalReviewsReceived(0)
                    .build();
        }

        return PeerReviewSummaryDTO.builder()
                .userId(userId)
                .userName(getUserDisplayName(user))
                .averageTechnicalSkills(peerReviewRepository.getAverageTechnicalSkillsRating(userId))
                .averageCommunication(peerReviewRepository.getAverageCommunicationRating(userId))
                .averageTeamwork(peerReviewRepository.getAverageTeamworkRating(userId))
                .averageProblemSolving(peerReviewRepository.getAverageProblemSolvingRating(userId))
                .averageOverall(peerReviewRepository.getAverageOverallRating(userId))
                .totalReviewsReceived(reviews.size())
                .build();
    }

    // ==================== Helper Methods ====================

    private PeerReviewDTO toDTO(PeerReview review, boolean hideReviewer) {
        return PeerReviewDTO.builder()
                .reviewId(review.getId())
                .projectId(review.getProject().getId())
                .reviewerId(hideReviewer ? null : review.getReviewer().getId())
                .reviewerName(hideReviewer ? "Anonymous" : getUserDisplayName(review.getReviewer()))
                .revieweeId(review.getReviewee().getId())
                .revieweeName(getUserDisplayName(review.getReviewee()))
                .technicalSkillsRating(review.getTechnicalSkillsRating())
                .communicationRating(review.getCommunicationRating())
                .teamworkRating(review.getTeamworkRating())
                .problemSolvingRating(review.getProblemSolvingRating())
                .overallContributionRating(review.getOverallContributionRating())
                .anonymousFeedback(review.getAnonymousFeedback())
                .isAnonymous(review.getIsAnonymous())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private String getUserDisplayName(User user) {
        if (user.getStudentProfile() != null) {
            return user.getStudentProfile().getFullName();
        } else if (user.getMentorProfile() != null) {
            return user.getMentorProfile().getFullName();
        }
        return user.getEmail();
    }
}
