package com.fyp.service;

import com.fyp.model.dto.ProjectBucketDTO;
import com.fyp.model.entity.ProjectBucket;
import com.fyp.model.entity.ProjectBucket.DifficultyLevel;
import com.fyp.model.entity.User;
import com.fyp.repository.ProjectBucketRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectBucketService {

    private final ProjectBucketRepository bucketRepository;
    private final UserRepository userRepository;

    public List<ProjectBucketDTO> getAvailableBuckets() {
        return bucketRepository.findBucketsWithAvailableSlots()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectBucketDTO> getAllBuckets() {
        return bucketRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getPostedAt() == null) return 1;
                    if (b.getPostedAt() == null) return -1;
                    return b.getPostedAt().compareTo(a.getPostedAt());
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectBucketDTO> getBucketsByDepartment(String department) {
        return bucketRepository.findByDepartmentAndIsAvailableTrue(department)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProjectBucketDTO> getBucketsByDifficulty(String difficulty) {
        DifficultyLevel level = DifficultyLevel.valueOf(difficulty.toUpperCase());
        return bucketRepository.findByDifficultyLevelAndIsAvailableTrue(level)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ProjectBucketDTO getBucket(Long bucketId) {
        ProjectBucket bucket = bucketRepository.findById(bucketId)
                .orElseThrow(() -> new RuntimeException("Bucket not found"));
        return toDTO(bucket);
    }

    @Transactional
    public ProjectBucketDTO createBucket(ProjectBucketDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectBucket bucket = ProjectBucket.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .department(dto.getDepartment())
                .technologies(dto.getTechnologies())
                .difficultyLevel(DifficultyLevel.valueOf(dto.getDifficultyLevel()))
                .maxTeams(dto.getMaxTeams() != null ? dto.getMaxTeams() : 1)
                .allocatedTeams(0)
                .isAvailable(true)
                .postedBy(user)
                .deadline(dto.getDeadline())
                .build();

        bucket = bucketRepository.save(bucket);
        return toDTO(bucket);
    }

    @Transactional
    public ProjectBucketDTO updateBucket(Long bucketId, ProjectBucketDTO dto) {
        ProjectBucket bucket = bucketRepository.findById(bucketId)
                .orElseThrow(() -> new RuntimeException("Bucket not found"));

        if (dto.getTitle() != null)
            bucket.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            bucket.setDescription(dto.getDescription());
        if (dto.getDepartment() != null)
            bucket.setDepartment(dto.getDepartment());
        if (dto.getTechnologies() != null)
            bucket.setTechnologies(dto.getTechnologies());
        if (dto.getDifficultyLevel() != null) {
            bucket.setDifficultyLevel(DifficultyLevel.valueOf(dto.getDifficultyLevel()));
        }
        if (dto.getMaxTeams() != null)
            bucket.setMaxTeams(dto.getMaxTeams());
        if (dto.getDeadline() != null)
            bucket.setDeadline(dto.getDeadline());

        bucket = bucketRepository.save(bucket);
        return toDTO(bucket);
    }

    @Transactional
    public ProjectBucketDTO allocateTeam(Long bucketId) {
        ProjectBucket bucket = bucketRepository.findById(bucketId)
                .orElseThrow(() -> new RuntimeException("Bucket not found"));

        if (!bucket.hasAvailableSlots()) {
            throw new RuntimeException("No available slots in this bucket");
        }

        bucket.setAllocatedTeams(bucket.getAllocatedTeams() + 1);
        if (bucket.getAllocatedTeams() >= bucket.getMaxTeams()) {
            bucket.setIsAvailable(false);
        }

        bucket = bucketRepository.save(bucket);
        return toDTO(bucket);
    }

    @Transactional
    public void deactivateBucket(Long bucketId) {
        ProjectBucket bucket = bucketRepository.findById(bucketId)
                .orElseThrow(() -> new RuntimeException("Bucket not found"));
        bucket.setIsAvailable(false);
        bucketRepository.save(bucket);
    }

    private ProjectBucketDTO toDTO(ProjectBucket bucket) {
        return ProjectBucketDTO.builder()
                .bucketId(bucket.getBucketId())
                .title(bucket.getTitle())
                .description(bucket.getDescription())
                .department(bucket.getDepartment())
                .technologies(bucket.getTechnologies())
                .difficultyLevel(bucket.getDifficultyLevel().name())
                .maxTeams(bucket.getMaxTeams())
                .allocatedTeams(bucket.getAllocatedTeams())
                .availableSlots(bucket.getMaxTeams() - bucket.getAllocatedTeams())
                .isAvailable(bucket.getIsAvailable())
                .postedById(bucket.getPostedBy() != null ? bucket.getPostedBy().getId() : null)
                .postedByName(bucket.getPostedBy() != null ? bucket.getPostedBy().getEmail() : null)
                .postedAt(bucket.getPostedAt())
                .deadline(bucket.getDeadline())
                .build();
    }
}
