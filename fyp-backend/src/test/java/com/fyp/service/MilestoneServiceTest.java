package com.fyp.service;

import com.fyp.model.dto.MilestoneDTO;
import com.fyp.model.entity.Milestone;
import com.fyp.model.entity.Milestone.MilestoneStatus;
import com.fyp.model.entity.Project;
import com.fyp.repository.MilestoneRepository;
import com.fyp.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MilestoneService Tests")
class MilestoneServiceTest {

    @Mock
    private MilestoneRepository milestoneRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private MilestoneService milestoneService;

    private Project project;
    private Milestone milestone;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Project 1")
                .build();

        milestone = Milestone.builder()
                .milestoneId(1L)
                .project(project)
                .milestoneName("Phase 1")
                .status(MilestoneStatus.PENDING)
                .completionPercentage(0)
                .reviewedByMentor(false)
                .build();
    }

    @Test
    @DisplayName("Create Milestone - Should save and return DTO")
    void createMilestone_ShouldSave() {
        MilestoneDTO dto = MilestoneDTO.builder()
                .projectId(1L)
                .milestoneName("Phase 1")
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(milestoneRepository.save(any(Milestone.class))).thenReturn(milestone);

        MilestoneDTO result = milestoneService.createMilestone(dto);

        assertNotNull(result);
        assertEquals("Phase 1", result.getMilestoneName());
        verify(milestoneRepository).save(any(Milestone.class));
    }

    @Test
    @DisplayName("Update Status - Should update status and percentage")
    void updateStatus_ShouldUpdate() {
        when(milestoneRepository.findById(1L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(i -> i.getArgument(0));

        MilestoneDTO result = milestoneService.updateStatus(1L, "IN_PROGRESS");

        assertEquals("IN_PROGRESS", result.getStatus());
        assertEquals(10, result.getCompletionPercentage());
    }

    @Test
    @DisplayName("Complete Milestone - Should mark completed")
    void completeMilestone_ShouldComplete() {
        when(milestoneRepository.findById(1L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(i -> i.getArgument(0));

        MilestoneDTO result = milestoneService.completeMilestone(1L);

        assertEquals("COMPLETED", result.getStatus());
        assertEquals(100, result.getCompletionPercentage());
        assertNotNull(result.getCompletedAt());
    }

    @Test
    @DisplayName("Add Mentor Review - Should update feedback")
    void addMentorReview_ShouldUpdate() {
        when(milestoneRepository.findById(1L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(i -> i.getArgument(0));

        MilestoneDTO result = milestoneService.addMentorReview(1L, "Good job");

        assertTrue(result.getReviewedByMentor());
        assertEquals("Good job", result.getMentorFeedback());
    }

    @Test
    @DisplayName("Get Project Milestones - Should return list")
    void getProjectMilestones_ShouldReturnList() {
        when(milestoneRepository.findByProjectIdOrderByDueDateAsc(1L))
                .thenReturn(Arrays.asList(milestone));

        List<MilestoneDTO> result = milestoneService.getProjectMilestones(1L);

        assertEquals(1, result.size());
        assertEquals("Phase 1", result.get(0).getMilestoneName());
    }

    @Test
    @DisplayName("Get Milestone - Should return DTO")
    void getMilestone_ShouldReturnDTO() {
        when(milestoneRepository.findById(1L)).thenReturn(Optional.of(milestone));

        MilestoneDTO result = milestoneService.getMilestone(1L);

        assertNotNull(result);
        assertEquals("Phase 1", result.getMilestoneName());
    }

    @Test
    @DisplayName("Get Milestone - Should throw if not found")
    void getMilestone_ShouldThrowIfNotFound() {
        when(milestoneRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> milestoneService.getMilestone(1L));
    }

    @Test
    @DisplayName("Update Milestone - Should update fields")
    void updateMilestone_ShouldUpdate() {
        MilestoneDTO dto = MilestoneDTO.builder()
                .milestoneName("Updated Phase")
                .description("Updated DESC")
                .build();

        when(milestoneRepository.findById(1L)).thenReturn(Optional.of(milestone));
        when(milestoneRepository.save(any(Milestone.class))).thenAnswer(i -> i.getArgument(0));

        MilestoneDTO result = milestoneService.updateMilestone(1L, dto);

        assertEquals("Updated Phase", result.getMilestoneName());
        assertEquals("Updated DESC", result.getDescription());
    }

    @Test
    @DisplayName("Get Overdue Milestones - Should return list")
    void getOverdueMilestones_ShouldReturnList() {
        when(milestoneRepository.findOverdueMilestones(eq(1L), any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(milestone));

        List<MilestoneDTO> result = milestoneService.getOverdueMilestones(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Pending Reviews - Should return list")
    void getPendingReviews_ShouldReturnList() {
        when(milestoneRepository.findByProjectIdAndReviewedByMentorFalseAndStatus(1L, MilestoneStatus.COMPLETED))
                .thenReturn(Arrays.asList(milestone));

        List<MilestoneDTO> result = milestoneService.getPendingReviews(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Project Progress - Should calculate percentage")
    void getProjectProgress_ShouldCalculate() {
        when(milestoneRepository.countByProject(1L)).thenReturn(10L);
        when(milestoneRepository.countCompletedByProject(1L)).thenReturn(5L);

        Double progress = milestoneService.getProjectProgress(1L);

        assertEquals(50.0, progress);
    }

    @Test
    @DisplayName("Delete Milestone - Should delete")
    void deleteMilestone_ShouldDelete() {
        milestoneService.deleteMilestone(1L);
        verify(milestoneRepository).deleteById(1L);
    }
}
