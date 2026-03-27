package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.PeerReviewDTO;
import com.fyp.model.dto.PeerReviewSummaryDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.PeerReviewRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PeerReviewService Tests")
class PeerReviewServiceTest {

    @Mock
    private PeerReviewRepository peerReviewRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;

    @InjectMocks
    private PeerReviewService peerReviewService;

    private User reviewer;
    private User reviewee;
    private Project project;
    private PeerReviewDTO reviewDTO;
    private PeerReview peerReview;
    private Team team;

    @BeforeEach
    void setUp() {
        reviewer = User.builder().id(1L).email("reviewer@test.com").build();
        reviewee = User.builder().id(2L).email("reviewee@test.com").build();

        project = Project.builder().id(1L).title("Test Project").build();

        team = Team.builder()
                .id(1L)
                .project(project)
                .status(TeamStatus.ACTIVE)
                .build();
        project.setTeam(team);

        reviewDTO = PeerReviewDTO.builder()
                .projectId(1L)
                .revieweeId(2L)
                .technicalSkillsRating(5)
                .communicationRating(4)
                .teamworkRating(5)
                .problemSolvingRating(4)
                .overallContributionRating(5)
                .anonymousFeedback("Great work")
                .isAnonymous(true)
                .build();

        peerReview = PeerReview.builder()
                .id(1L)
                .project(project)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .technicalSkillsRating(5)
                .communicationRating(4)
                .teamworkRating(5)
                .problemSolvingRating(4)
                .overallContributionRating(5)
                .anonymousFeedback("Great work")
                .isAnonymous(true)
                .build();
    }

    @Test
    @DisplayName("Submit Review - Should success")
    void submitReview_ShouldSuccess() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(reviewer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(reviewee));
        when(peerReviewRepository.existsByProjectIdAndReviewerIdAndRevieweeId(1L, 1L, 2L)).thenReturn(false);
        when(peerReviewRepository.save(any(PeerReview.class))).thenReturn(peerReview);

        PeerReviewDTO result = peerReviewService.submitReview(1L, reviewDTO);

        assertNotNull(result);
        verify(peerReviewRepository).save(any(PeerReview.class));
    }

    @Test
    @DisplayName("Submit Review - Should throw if already reviewed")
    void submitReview_ShouldThrowIfAlreadyReviewed() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(reviewer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(reviewee));
        when(peerReviewRepository.existsByProjectIdAndReviewerIdAndRevieweeId(1L, 1L, 2L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> peerReviewService.submitReview(1L, reviewDTO));
    }

    @Test
    @DisplayName("Submit Review - Should throw if self review")
    void submitReview_ShouldThrowIfSelfReview() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(2L)).thenReturn(Optional.of(reviewee)); // reviewer is same as reviewee
        when(userRepository.findById(2L)).thenReturn(Optional.of(reviewee));

        reviewDTO.setRevieweeId(2L);
        assertThrows(IllegalArgumentException.class, () -> peerReviewService.submitReview(2L, reviewDTO));
    }

    @Test
    @DisplayName("Get Reviews For User In Project - Should return list")
    void getReviewsForUserInProject_ShouldReturnList() {
        when(peerReviewRepository.findFeedbackForUserInProject(2L, 1L))
                .thenReturn(Collections.singletonList(peerReview));

        List<PeerReviewDTO> result = peerReviewService.getReviewsForUserInProject(2L, 1L);

        assertFalse(result.isEmpty());
        assertTrue(result.get(0).getIsAnonymous());
        // Verify reviewer name is hidden for anonymous reviews
        assertEquals("Anonymous", result.get(0).getReviewerName());
    }

    @Test
    @DisplayName("Get Reviews Submitted By User - Should return list")
    void getReviewsSubmittedByUser_ShouldReturnList() {
        when(peerReviewRepository.findByReviewerId(1L)).thenReturn(Collections.singletonList(peerReview));

        List<PeerReviewDTO> result = peerReviewService.getReviewsSubmittedByUser(1L);

        assertFalse(result.isEmpty());
    }

    @Test
    @DisplayName("Get Reviewable Team Members - Should exclude self")
    void getReviewableTeamMembers_ShouldExcludeSelf() {
        TeamMember member1 = TeamMember.builder().user(reviewer).build();
        TeamMember member2 = TeamMember.builder().user(reviewee).build();
        team.setMembers(Arrays.asList(member1, member2));

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        List<TeamMember> result = peerReviewService.getReviewableTeamMembers(1L, 1L);

        assertEquals(1, result.size());
        assertEquals(reviewee.getId(), result.get(0).getUser().getId());
    }

    @Test
    @DisplayName("Get User Review Summary - Should return summary")
    void getUserReviewSummary_ShouldReturnSummary() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(reviewee));
        when(peerReviewRepository.findByRevieweeId(2L)).thenReturn(Collections.singletonList(peerReview));

        when(peerReviewRepository.getAverageTechnicalSkillsRating(2L)).thenReturn(5.0);
        when(peerReviewRepository.getAverageCommunicationRating(2L)).thenReturn(4.0);
        when(peerReviewRepository.getAverageTeamworkRating(2L)).thenReturn(5.0);
        when(peerReviewRepository.getAverageProblemSolvingRating(2L)).thenReturn(4.0);
        when(peerReviewRepository.getAverageOverallRating(2L)).thenReturn(5.0);

        PeerReviewSummaryDTO result = peerReviewService.getUserReviewSummary(2L);

        assertNotNull(result);
        assertEquals(1, result.getTotalReviewsReceived());
        assertEquals(5.0, result.getAverageTechnicalSkills());
    }
}
