package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.SharedResourceDTO;
import com.fyp.model.entity.SharedResource;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.repository.SharedResourceRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final SharedResourceRepository resourceRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    /**
     * Create a new shared resource
     */
    @Transactional
    public SharedResourceDTO createResource(Long userId, SharedResourceDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Team team = null;
        if (dto.getTeamId() != null) {
            team = teamRepository.findById(dto.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        }

        SharedResource resource = SharedResource.builder()
                .sharedBy(user)
                .team(team)
                .resourceTitle(dto.getResourceTitle())
                .resourceType(dto.getResourceType())
                .resourceUrl(dto.getResourceUrl())
                .description(dto.getDescription())
                .projectPhase(dto.getProjectPhase())
                .build();

        SharedResource saved = resourceRepository.save(resource);
        return toDTO(saved);
    }

    /**
     * Get resources for a team
     */
    public List<SharedResourceDTO> getTeamResources(Long teamId, String type, String phase) {
        List<SharedResource> resources;

        if (type != null && !type.isBlank()) {
            resources = resourceRepository.findByTeamIdAndResourceTypeOrderByCreatedAtDesc(teamId, type);
        } else if (phase != null && !phase.isBlank()) {
            resources = resourceRepository.findByTeamIdAndProjectPhaseOrderByCreatedAtDesc(teamId, phase);
        } else {
            resources = resourceRepository.findByTeamIdOrderByCreatedAtDesc(teamId);
        }

        return resources.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Delete a resource
     */
    @Transactional
    public void deleteResource(Long resourceId, Long userId) {
        SharedResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (!resource.getSharedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own resources");
        }

        resourceRepository.delete(resource);
    }

    private SharedResourceDTO toDTO(SharedResource resource) {
        return SharedResourceDTO.builder()
                .resourceId(resource.getId())
                .sharedById(resource.getSharedBy().getId())
                .sharedByName(getUserDisplayName(resource.getSharedBy()))
                .teamId(resource.getTeam() != null ? resource.getTeam().getId() : null)
                .resourceTitle(resource.getResourceTitle())
                .resourceType(resource.getResourceType())
                .resourceUrl(resource.getResourceUrl())
                .description(resource.getDescription())
                .projectPhase(resource.getProjectPhase())
                .createdAt(resource.getCreatedAt())
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
