package com.fyp.service;

import com.fyp.model.entity.*;
import com.fyp.model.enums.MemberRole;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PdfReportService Tests")
class PdfReportServiceTest {

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private TeamMemberRepository teamMemberRepository;
    @Mock
    private MilestoneRepository milestoneRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private PdfReportService pdfReportService;

    private Project project;
    private Team team;
    private User user;
    private StudentProfile studentProfile;
    private TeamMember teamMember;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@test.com")
                .build();

        studentProfile = StudentProfile.builder()
                .id(1L)
                .user(user)
                .fullName("Test Student")
                .enrollmentNumber("123456")
                .branch("CSE")
                .currentSemester(8)
                .cgpa(BigDecimal.valueOf(9.0))
                .skills(Collections.singletonList("Java"))
                .bio("Bio")
                .build();

        team = Team.builder()
                .id(1L)
                .teamName("Test Team")
                .status(TeamStatus.ACTIVE)
                .currentMemberCount(1)
                .maxMembers(4)
                .build();

        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .domain("Web")
                .status(ProjectStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now())
                .abstractText("Abstract")
                .technologies(Collections.singletonList("Spring Boot"))
                .team(team)
                .build();

        team.setProject(project);

        teamMember = TeamMember.builder()
                .id(1L)
                .team(team)
                .user(user)
                .role(MemberRole.LEADER)
                .joinedAt(LocalDateTime.now())
                .contributionScore(100)
                .build();
    }

    @Test
    @DisplayName("Generate Project Report - Should return byte array")
    void generateProjectReport_ShouldReturnByteArray() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(teamMemberRepository.findByTeamId(1L)).thenReturn(Collections.singletonList(teamMember));
        when(milestoneRepository.findByProjectIdOrderByDueDateAsc(1L)).thenReturn(Collections.emptyList());
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));

        byte[] result = pdfReportService.generateProjectReport(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    @DisplayName("Generate Team Report - Should return byte array")
    void generateTeamReport_ShouldReturnByteArray() {
        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(teamMemberRepository.findByTeamId(1L)).thenReturn(Collections.singletonList(teamMember));
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));

        byte[] result = pdfReportService.generateTeamReport(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    @DisplayName("Generate Student Summary - Should return byte array")
    void generateStudentSummary_ShouldReturnByteArray() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));

        byte[] result = pdfReportService.generateStudentSummary(1L);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    @DisplayName("Generate Project Report - Should throw if not found")
    void generateProjectReport_ShouldThrowIfNotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> pdfReportService.generateProjectReport(1L));
    }

    @Test
    @DisplayName("Generate Team Report - Should throw if not found")
    void generateTeamReport_ShouldThrowIfNotFound() {
        when(teamRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> pdfReportService.generateTeamReport(1L));
    }

    @Test
    @DisplayName("Generate Student Summary - Should throw if not found")
    void generateStudentSummary_ShouldThrowIfNotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> pdfReportService.generateStudentSummary(1L));
    }
}
