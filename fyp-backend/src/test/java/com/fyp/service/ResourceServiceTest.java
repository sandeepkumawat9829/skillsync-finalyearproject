package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.SharedResourceDTO;
import com.fyp.model.entity.SharedResource;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.repository.SharedResourceRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResourceService Tests")
class ResourceServiceTest {

    @Mock
    private SharedResourceRepository resourceRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ResourceService resourceService;

    private User user;
    private Team team;
    private SharedResource resource;
    private SharedResourceDTO resourceDTO;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@test.com").build();
        team = Team.builder().id(1L).teamName("Test Team").build();

        resource = SharedResource.builder()
                .id(1L)
                .sharedBy(user)
                .team(team)
                .resourceTitle("Test Resource")
                .resourceType("DOCUMENT")
                .projectPhase("PLANNING")
                .build();

        resourceDTO = SharedResourceDTO.builder()
                .resourceTitle("Test Resource")
                .resourceType("DOCUMENT")
                .projectPhase("PLANNING")
                .teamId(1L)
                .build();
    }

    @Test
    @DisplayName("Create Resource - Should success")
    void createResource_ShouldSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(resourceRepository.save(any(SharedResource.class))).thenReturn(resource);

        SharedResourceDTO result = resourceService.createResource(1L, resourceDTO);

        assertNotNull(result);
        assertEquals("Test Resource", result.getResourceTitle());
        verify(resourceRepository).save(any(SharedResource.class));
    }

    @Test
    @DisplayName("Get Team Resources - Filter by Type")
    void getTeamResources_FilterByType() {
        when(resourceRepository.findByTeamIdAndResourceTypeOrderByCreatedAtDesc(1L, "DOCUMENT"))
                .thenReturn(Collections.singletonList(resource));

        List<SharedResourceDTO> result = resourceService.getTeamResources(1L, "DOCUMENT", null);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Team Resources - Filter by Phase")
    void getTeamResources_FilterByPhase() {
        when(resourceRepository.findByTeamIdAndProjectPhaseOrderByCreatedAtDesc(1L, "PLANNING"))
                .thenReturn(Collections.singletonList(resource));

        List<SharedResourceDTO> result = resourceService.getTeamResources(1L, null, "PLANNING");

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Team Resources - No Filter")
    void getTeamResources_NoFilter() {
        when(resourceRepository.findByTeamIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.singletonList(resource));

        List<SharedResourceDTO> result = resourceService.getTeamResources(1L, null, null);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Delete Resource - Should success")
    void deleteResource_ShouldSuccess() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        resourceService.deleteResource(1L, 1L);

        verify(resourceRepository).delete(resource);
    }

    @Test
    @DisplayName("Delete Resource - Should fail if not owner")
    void deleteResource_ShouldFailIfNotOwner() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        assertThrows(IllegalArgumentException.class, () -> resourceService.deleteResource(1L, 2L));
    }

    @Test
    @DisplayName("Delete Resource - Should fail if not found")
    void deleteResource_ShouldFailIfNotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> resourceService.deleteResource(1L, 1L));
    }
}
