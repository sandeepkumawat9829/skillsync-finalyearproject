package com.fyp.service;

import com.fyp.model.dto.ProjectBucketDTO;
import com.fyp.model.entity.ProjectBucket;
import com.fyp.model.entity.ProjectBucket.DifficultyLevel;
import com.fyp.model.entity.User;
import com.fyp.repository.ProjectBucketRepository;
import com.fyp.repository.UserRepository;
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
@DisplayName("ProjectBucketService Tests")
class ProjectBucketServiceTest {

    @Mock
    private ProjectBucketRepository bucketRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProjectBucketService bucketService;

    private User user;
    private ProjectBucket bucket;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@test.com")
                .build();

        bucket = ProjectBucket.builder()
                .bucketId(1L)
                .title("AI Project")
                .description("Build an AI")
                .department("CS")
                .technologies(Arrays.asList("Python", "ML"))
                .difficultyLevel(DifficultyLevel.HARD)
                .maxTeams(2)
                .allocatedTeams(0)
                .isAvailable(true)
                .postedBy(user)
                .deadline(LocalDateTime.now().plusDays(30))
                .build();
    }

    @Test
    @DisplayName("Get Available Buckets - Should return list")
    void getAvailableBuckets_ShouldReturnList() {
        when(bucketRepository.findBucketsWithAvailableSlots()).thenReturn(Arrays.asList(bucket));

        List<ProjectBucketDTO> result = bucketService.getAvailableBuckets();

        assertEquals(1, result.size());
        assertEquals("AI Project", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Get All Buckets - Should return list")
    void getAllBuckets_ShouldReturnList() {
        when(bucketRepository.findByIsAvailableTrueOrderByPostedAtDesc()).thenReturn(Arrays.asList(bucket));

        List<ProjectBucketDTO> result = bucketService.getAllBuckets();

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Bucket - Should return DTO")
    void getBucket_ShouldReturnDTO() {
        when(bucketRepository.findById(1L)).thenReturn(Optional.of(bucket));

        ProjectBucketDTO result = bucketService.getBucket(1L);

        assertNotNull(result);
        assertEquals("AI Project", result.getTitle());
    }

    @Test
    @DisplayName("Create Bucket - Should save and return DTO")
    void createBucket_ShouldSave() {
        ProjectBucketDTO dto = ProjectBucketDTO.builder()
                .title("AI Project")
                .difficultyLevel("HARD")
                .maxTeams(2)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(bucketRepository.save(any(ProjectBucket.class))).thenReturn(bucket);

        ProjectBucketDTO result = bucketService.createBucket(dto, 1L);

        assertNotNull(result);
        assertEquals("AI Project", result.getTitle());
    }

    @Test
    @DisplayName("Update Bucket - Should update allowed fields")
    void updateBucket_ShouldUpdate() {
        ProjectBucketDTO dto = ProjectBucketDTO.builder()
                .title("Updated Title")
                .maxTeams(3)
                .build();

        when(bucketRepository.findById(1L)).thenReturn(Optional.of(bucket));
        when(bucketRepository.save(any(ProjectBucket.class))).thenAnswer(i -> i.getArgument(0));

        ProjectBucketDTO result = bucketService.updateBucket(1L, dto);

        assertEquals("Updated Title", result.getTitle());
        assertEquals(3, result.getMaxTeams());
    }

    @Test
    @DisplayName("Allocate Team - Should increment allocated count")
    void allocateTeam_ShouldIncrement() {
        when(bucketRepository.findById(1L)).thenReturn(Optional.of(bucket));
        when(bucketRepository.save(any(ProjectBucket.class))).thenAnswer(i -> i.getArgument(0));

        ProjectBucketDTO result = bucketService.allocateTeam(1L);

        assertEquals(1, result.getAllocatedTeams());
        assertTrue(result.getIsAvailable());
    }

    @Test
    @DisplayName("Allocate Team - Should throw if full")
    void allocateTeam_ShouldThrowIfFull() {
        bucket.setAllocatedTeams(2);
        bucket.setMaxTeams(2);
        when(bucketRepository.findById(1L)).thenReturn(Optional.of(bucket));

        assertThrows(RuntimeException.class, () -> bucketService.allocateTeam(1L));
    }

    @Test
    @DisplayName("Deactivate Bucket - Should set available to false")
    void deactivateBucket_ShouldDeactivate() {
        when(bucketRepository.findById(1L)).thenReturn(Optional.of(bucket));
        when(bucketRepository.save(any(ProjectBucket.class))).thenAnswer(i -> i.getArgument(0));

        bucketService.deactivateBucket(1L);

        assertFalse(bucket.getIsAvailable());
        verify(bucketRepository).save(bucket);
    }
}
