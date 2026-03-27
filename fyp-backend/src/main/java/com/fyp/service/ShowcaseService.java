package com.fyp.service;

import com.fyp.exception.ResourceNotFoundException;
import com.fyp.model.dto.ProjectShowcaseDTO;
import com.fyp.model.entity.*;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowcaseService {

    private final ProjectShowcaseRepository showcaseRepository;
    private final ShowcaseLikeRepository likeRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    /**
     * Get public gallery with pagination
     */
    public List<ProjectShowcaseDTO> getGallery(int page, int size, String sortBy, Long userId) {
        Page<ProjectShowcase> showcases;
        PageRequest pageRequest = PageRequest.of(page, size);

        switch (sortBy != null ? sortBy.toLowerCase() : "recent") {
            case "likes":
                showcases = showcaseRepository.findByMostLiked(pageRequest);
                break;
            case "views":
                showcases = showcaseRepository.findByMostViewed(pageRequest);
                break;
            default:
                showcases = showcaseRepository.findPublished(pageRequest);
        }

        return showcases.getContent().stream()
                .map(showcase -> toDTO(showcase, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get single showcase by ID
     */
    @Transactional
    public ProjectShowcaseDTO getShowcase(Long showcaseId, Long userId) {
        ProjectShowcase showcase = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Showcase not found"));

        // Increment view count
        showcase.setViewsCount(showcase.getViewsCount() + 1);
        showcaseRepository.save(showcase);

        return toDTO(showcase, userId);
    }

    /**
     * Publish a project to showcase
     */
    @Transactional
    public ProjectShowcaseDTO publishProject(Long projectId, ProjectShowcaseDTO request, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // Check if already has showcase
        ProjectShowcase showcase = showcaseRepository.findByProjectId(projectId)
                .orElse(ProjectShowcase.builder().project(project).build());

        showcase.setIsPublished(true);
        showcase.setAcademicYear(request.getAcademicYear());
        showcase.setDemoVideoUrl(request.getDemoVideoUrl());
        showcase.setPresentationUrl(request.getPresentationUrl());
        showcase.setLiveDemoUrl(request.getLiveDemoUrl());
        showcase.setGithubUrl(request.getGithubUrl() != null ? request.getGithubUrl() : project.getGithubRepoUrl());
        showcase.setAwards(request.getAwards());
        showcase.setTags(request.getTags());
        showcase.setPublishedAt(LocalDateTime.now());

        ProjectShowcase saved = showcaseRepository.save(showcase);
        return toDTO(saved, userId);
    }

    /**
     * Toggle like on a showcase
     */
    @Transactional
    public boolean toggleLike(Long showcaseId, Long userId) {
        ProjectShowcase showcase = showcaseRepository.findById(showcaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Showcase not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (likeRepository.existsByUserIdAndShowcaseId(userId, showcaseId)) {
            // Unlike
            likeRepository.deleteByUserIdAndShowcaseId(userId, showcaseId);
            showcase.setLikesCount(Math.max(0, showcase.getLikesCount() - 1));
            showcaseRepository.save(showcase);
            return false;
        } else {
            // Like
            ShowcaseLike like = ShowcaseLike.builder()
                    .user(user)
                    .showcase(showcase)
                    .build();
            likeRepository.save(like);
            showcase.setLikesCount(showcase.getLikesCount() + 1);
            showcaseRepository.save(showcase);
            return true;
        }
    }

    /**
     * Search showcases
     */
    public List<ProjectShowcaseDTO> search(String query, int page, int size, Long userId) {
        Page<ProjectShowcase> results = showcaseRepository.search(query, PageRequest.of(page, size));
        return results.getContent().stream()
                .map(showcase -> toDTO(showcase, userId))
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private ProjectShowcaseDTO toDTO(ProjectShowcase showcase, Long userId) {
        Project project = showcase.getProject();
        Team team = project.getTeam();

        List<String> teamMembers = team != null ? team.getMembers().stream()
                .map(member -> getUserDisplayName(member.getUser()))
                .collect(Collectors.toList()) : List.of();

        String mentorName = null;
        if (team != null && team.getMentorAssignment() != null) {
            mentorName = getUserDisplayName(team.getMentorAssignment().getMentor());
        }

        boolean hasLiked = userId != null && likeRepository.existsByUserIdAndShowcaseId(userId, showcase.getId());

        return ProjectShowcaseDTO.builder()
                .showcaseId(showcase.getId())
                .projectId(project.getId())
                .projectTitle(project.getTitle())
                .projectAbstract(project.getAbstractText())
                .teamName(team != null ? team.getTeamName() : null)
                .teamMembers(teamMembers)
                .mentorName(mentorName)
                .isPublished(showcase.getIsPublished())
                .academicYear(showcase.getAcademicYear())
                .demoVideoUrl(showcase.getDemoVideoUrl())
                .presentationUrl(showcase.getPresentationUrl())
                .liveDemoUrl(showcase.getLiveDemoUrl())
                .githubUrl(showcase.getGithubUrl())
                .awards(showcase.getAwards())
                .tags(showcase.getTags())
                .technologies(project.getTechnologies())
                .viewsCount(showcase.getViewsCount())
                .likesCount(showcase.getLikesCount())
                .hasLiked(hasLiked)
                .publishedAt(showcase.getPublishedAt())
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
