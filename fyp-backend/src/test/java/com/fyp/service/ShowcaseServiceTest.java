package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.ProjectShowcaseDTO;
import com.fyp.model.entity.*;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.ProjectShowcaseRepository;
import com.fyp.repository.ShowcaseLikeRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShowcaseService Tests")
class ShowcaseServiceTest {

    @Mock
    private ProjectShowcaseRepository showcaseRepository;
    @Mock
    private ShowcaseLikeRepository likeRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShowcaseService showcaseService;

    private User user;
    private Project project;
    private ProjectShowcase showcase;
    private ProjectShowcaseDTO showcaseDTO;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@test.com").build();
        project = Project.builder().id(1L).title("Test Project").build();
        showcase = ProjectShowcase.builder()
                .id(1L)
                .project(project)
                .isPublished(true)
                .build();

        showcaseDTO = ProjectShowcaseDTO.builder()
                .academicYear("2023-2024")
                .build();
    }

    @Test
    @DisplayName("Get Gallery - Should return list")
    void getGallery_ShouldReturnList() {
        Page<ProjectShowcase> page = new PageImpl<>(Collections.singletonList(showcase));
        when(showcaseRepository.findPublished(any(PageRequest.class))).thenReturn(page);

        var result = showcaseService.getGallery(0, 10, "recent", 1L);

        assertFalse(result.isEmpty());
        assertEquals("Test Project", result.get(0).getProjectTitle());
    }

    @Test
    @DisplayName("Get Showcase - Should success")
    void getShowcase_ShouldSuccess() {
        when(showcaseRepository.findById(1L)).thenReturn(Optional.of(showcase));

        var result = showcaseService.getShowcase(1L, 1L);

        assertNotNull(result);
        assertEquals(1L, result.getShowcaseId());
        verify(showcaseRepository).save(showcase); // Verify view count increment save
    }

    @Test
    @DisplayName("Publish Project - Should success")
    void publishProject_ShouldSuccess() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(showcaseRepository.findByProjectId(1L)).thenReturn(Optional.empty());
        when(showcaseRepository.save(any(ProjectShowcase.class))).thenReturn(showcase);

        var result = showcaseService.publishProject(1L, showcaseDTO, 1L);

        assertNotNull(result);
        verify(showcaseRepository).save(any(ProjectShowcase.class));
    }

    @Test
    @DisplayName("Toggle Like - Should Like")
    void toggleLike_ShouldLike() {
        when(showcaseRepository.findById(1L)).thenReturn(Optional.of(showcase));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(likeRepository.existsByUserIdAndShowcaseId(1L, 1L)).thenReturn(false);

        boolean result = showcaseService.toggleLike(1L, 1L);

        assertTrue(result); // True means liked
        assertEquals(1, showcase.getLikesCount());
        verify(likeRepository).save(any(ShowcaseLike.class));
    }

    @Test
    @DisplayName("Toggle Like - Should Unlike")
    void toggleLike_ShouldUnlike() {
        showcase.setLikesCount(1);
        when(showcaseRepository.findById(1L)).thenReturn(Optional.of(showcase));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(likeRepository.existsByUserIdAndShowcaseId(1L, 1L)).thenReturn(true);

        boolean result = showcaseService.toggleLike(1L, 1L);

        assertFalse(result); // False means unliked
        assertEquals(0, showcase.getLikesCount());
        verify(likeRepository).deleteByUserIdAndShowcaseId(1L, 1L);
    }
}
