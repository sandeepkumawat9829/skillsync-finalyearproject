package com.fyp.service;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.*;
import com.fyp.repository.*;
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
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @Mock
    private TeamMemberRepository teamMemberRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private StudentProfile testProfile;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .role(Role.STUDENT)
                .build();

        testProfile = StudentProfile.builder()
                .id(1L)
                .user(testUser)
                .fullName("Test Student")
                .branch("CSE")
                .currentSemester(8)
                .cgpa(java.math.BigDecimal.valueOf(9.0))
                .skills(Arrays.asList("Java", "Spring"))
                .build();
    }

    @Test
    @DisplayName("Get Student Profile - Should return profile info")
    void getStudentProfile_ShouldReturnInfo() {
        // Given
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(teamMemberRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // When
        StudentProfileDTO result = userService.getStudentProfile(1L);

        // Then
        assertNotNull(result);
        assertEquals("Test Student", result.getFullName());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    @DisplayName("Get Student Profile - Should fail when not found")
    void getStudentProfile_ShouldFailWhenNotFound() {
        // Given
        when(studentProfileRepository.findByUserId(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            userService.getStudentProfile(999L);
        });
    }

    @Test
    @DisplayName("Search Students - Should filter by query")
    void searchStudents_ShouldFilterByQuery() {
        // Given
        when(studentProfileRepository.findAll()).thenReturn(Arrays.asList(testProfile));
        when(teamMemberRepository.findByUserId(anyLong())).thenReturn(Collections.emptyList());

        // When
        List<StudentProfileDTO> result = userService.searchStudents("java");

        // Then
        assertEquals(1, result.size());

        // When searching non-matching
        List<StudentProfileDTO> emptyResult = userService.searchStudents("python");
        assertEquals(0, emptyResult.size());
    }

    @Test
    @DisplayName("Get Students By Branch - Should return matching students")
    void getStudentsByBranch_ShouldReturnMatching() {
        // Given
        when(studentProfileRepository.findByBranch("CSE")).thenReturn(Arrays.asList(testProfile));
        when(teamMemberRepository.findByUserId(anyLong())).thenReturn(Collections.emptyList());

        // When
        List<StudentProfileDTO> result = userService.getStudentsByBranch("CSE");

        // Then
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Update Student Profile - Should update fields")
    void updateStudentProfile_ShouldUpdateFields() {
        // Given
        StudentProfileDTO updates = new StudentProfileDTO();
        updates.setFullName("Updated Name");
        updates.setCgpa(java.math.BigDecimal.valueOf(9.5));

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(testProfile));
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(testProfile);
        when(teamMemberRepository.findByUserId(anyLong())).thenReturn(Collections.emptyList());

        // When
        StudentProfileDTO result = userService.updateStudentProfile(1L, updates);

        // Then
        assertNotNull(result);
        verify(studentProfileRepository, times(1)).save(any(StudentProfile.class));
        assertEquals("Updated Name", testProfile.getFullName());
    }

    @Test
    @DisplayName("Get Available Students - Should return students without team")
    void getAvailableStudents_ShouldReturnTeamLessStudents() {
        // Given
        when(studentProfileRepository.findAll()).thenReturn(Arrays.asList(testProfile));
        // Mock that user has NO team
        when(teamMemberRepository.findByUserId(1L)).thenReturn(Collections.emptyList());

        // When
        List<StudentProfileDTO> result = userService.getAvailableStudents();

        // Then
        assertEquals(1, result.size());
    }
}
