package com.fyp.service;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.User;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SkillMatchingService Tests")
class SkillMatchingServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private SkillMatchingService skillMatchingService;

    private Project project;
    private StudentProfile profile1;
    private StudentProfile profile2;
    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).email("user1@test.com").build();
        user2 = User.builder().id(2L).email("user2@test.com").build();

        project = Project.builder()
                .id(1L)
                .title("AI Project")
                .technologies(Arrays.asList("Java", "Python", "ML"))
                .team(null) // Incomplete team
                .build();

        profile1 = StudentProfile.builder()
                .id(1L)
                .user(user1)
                .fullName("Student One")
                .skills(Arrays.asList("Java", "Python")) // High match
                .build();

        profile2 = StudentProfile.builder()
                .id(2L)
                .user(user2) // Ensure user is set
                .fullName("Student Two")
                .skills(Arrays.asList("React", "CSS")) // No match
                .build();
    }

    @Test
    @DisplayName("Suggest Team Members - Should return matches sorted by score")
    void suggestTeamMembers_ShouldReturnMatches() {
        // Given
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(studentProfileRepository.findAll()).thenReturn(Arrays.asList(profile1, profile2));

        // When
        List<StudentProfileDTO> result = skillMatchingService.suggestTeamMembers(1L, 5);

        // Then
        assertEquals(1, result.size()); // Only profile1 matches
        assertEquals("Student One", result.get(0).getFullName());
        assertTrue(result.get(0).getMatchScore() > 0);
    }

    @Test
    @DisplayName("Suggest Team Members - Should return empty if no requirements")
    void suggestTeamMembers_ShouldReturnEmpty_WhenNoRequirements() {
        // Given
        project.setTechnologies(null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        // When
        List<StudentProfileDTO> result = skillMatchingService.suggestTeamMembers(1L, 5);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Find Matching Projects - Should return matches")
    void findMatchingProjects_ShouldReturnMatches() {
        // Given
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile1));
        when(projectRepository.findAll()).thenReturn(Arrays.asList(project));

        // When
        List<Project> result = skillMatchingService.findMatchingProjects(1L, 5);

        // Then
        assertEquals(1, result.size());
        assertEquals("AI Project", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Find Matching Projects - Should filter full teams")
    void findMatchingProjects_ShouldFilterFullTeams() {
        // Given
        Team fullTeam = Team.builder().id(1L).isComplete(true).build();
        project.setTeam(fullTeam);

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile1));
        when(projectRepository.findAll()).thenReturn(Arrays.asList(project));

        // When
        List<Project> result = skillMatchingService.findMatchingProjects(1L, 5);

        // Then
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Suggest Team Members - Should throw if project not found")
    void suggestTeamMembers_ShouldThrowIfProjectNotFound() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> skillMatchingService.suggestTeamMembers(99L, 5));
    }

    @Test
    @DisplayName("Find Matching Projects - Should throw if profile not found")
    void findMatchingProjects_ShouldThrowIfProfileNotFound() {
        when(studentProfileRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> skillMatchingService.findMatchingProjects(99L, 5));
    }

    @Test
    @DisplayName("Find Matching Projects - Should return empty if student has no skills")
    void findMatchingProjects_ShouldReturnEmpty_WhenNoSkills() {
        profile1.setSkills(null);
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile1));

        List<Project> result = skillMatchingService.findMatchingProjects(1L, 5);

        assertTrue(result.isEmpty());
    }
}
