package com.fyp.service;

import com.fyp.model.dto.IssueCommentDTO;
import com.fyp.model.dto.IssueDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.IssueStatus;
import com.fyp.model.enums.IssueType;
import com.fyp.model.enums.IssuePriority;
import com.fyp.repository.IssueCommentRepository;
import com.fyp.repository.IssueRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.TaskRepository;
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
@DisplayName("IssueService Tests")
class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;
    @Mock
    private IssueCommentRepository issueCommentRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private IssueService issueService;

    private Project project;
    private User reporter;
    private User assignee;
    private Issue issue;
    private IssueComment comment;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Project 1")
                .build();

        reporter = User.builder()
                .id(1L)
                .email("reporter@test.com")
                .build();

        assignee = User.builder()
                .id(2L)
                .email("assignee@test.com")
                .build();

        issue = Issue.builder()
                .id(1L)
                .project(project)
                .reportedBy(reporter)
                .assignedTo(assignee)
                .title("Bug found")
                .status(IssueStatus.OPEN)
                .issueType(IssueType.BUG)
                .priority(IssuePriority.HIGH)
                .build();

        comment = IssueComment.builder()
                .id(1L)
                .issue(issue)
                .user(reporter)
                .commentText("Test comment")
                .build();
    }

    @Test
    @DisplayName("Create Issue - Should save and notify")
    void createIssue_ShouldSave() {
        IssueDTO dto = IssueDTO.builder()
                .projectId(1L)
                .assignedTo(2L)
                .title("Bug found")
                .issueType(IssueType.BUG)
                .priority(IssuePriority.HIGH)
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
        when(issueRepository.save(any(Issue.class))).thenReturn(issue);

        IssueDTO result = issueService.createIssue(dto, 1L);

        assertNotNull(result);
        assertEquals("Bug found", result.getTitle());
        verify(notificationService).sendNotification(eq(2L), anyString(), anyString());
    }

    @Test
    @DisplayName("Get Issue - Should return DTO")
    void getIssue_ShouldReturnDTO() {
        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));

        IssueDTO result = issueService.getIssue(1L);

        assertNotNull(result);
        assertEquals("Bug found", result.getTitle());
    }

    @Test
    @DisplayName("Get Issues by Project - Should return list")
    void getIssuesByProject_ShouldReturnList() {
        when(issueRepository.findByProjectId(1L)).thenReturn(Arrays.asList(issue));

        List<IssueDTO> result = issueService.getIssuesByProject(1L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Issues by User - Should return list")
    void getIssuesByUser_ShouldReturnList() {
        when(issueRepository.findByAssignedToId(2L)).thenReturn(Arrays.asList(issue));

        List<IssueDTO> result = issueService.getIssuesByUser(2L);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Get Issues by Status - Should return list")
    void getIssuesByStatus_ShouldReturnList() {
        when(issueRepository.findByProjectIdAndStatus(1L, IssueStatus.OPEN)).thenReturn(Arrays.asList(issue));

        List<IssueDTO> result = issueService.getIssuesByStatus(1L, IssueStatus.OPEN);

        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("Update Issue - Should update and notify new assignee")
    void updateIssue_ShouldUpdate() {
        IssueDTO dto = IssueDTO.builder()
                .title("Updated Title")
                .assignedTo(2L)
                .status(IssueStatus.RESOLVED)
                .build();

        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignee));
        when(issueRepository.save(any(Issue.class))).thenAnswer(i -> i.getArgument(0));

        IssueDTO result = issueService.updateIssue(1L, dto, 1L);

        assertEquals("Updated Title", result.getTitle());
        assertEquals(IssueStatus.RESOLVED, result.getStatus());
        verify(notificationService).sendNotification(eq(2L), anyString(), anyString());
    }

    @Test
    @DisplayName("Add Comment - Should save")
    void addComment_ShouldSave() {
        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));
        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));
        when(issueCommentRepository.save(any(IssueComment.class))).thenReturn(comment);

        IssueCommentDTO result = issueService.addComment(1L, "Test comment", 1L);

        assertNotNull(result);
        assertEquals("Test comment", result.getCommentText());
    }

    @Test
    @DisplayName("Get Comments - Should return list")
    void getComments_ShouldReturnList() {
        when(issueCommentRepository.findByIssueIdOrderByCreatedAtAsc(1L))
                .thenReturn(Arrays.asList(comment));

        List<IssueCommentDTO> result = issueService.getComments(1L);

        assertEquals(1, result.size());
        assertEquals("Test comment", result.get(0).getCommentText());
    }

    @Test
    @DisplayName("Delete Issue - Should delete")
    void deleteIssue_ShouldDelete() {
        when(issueRepository.findById(1L)).thenReturn(Optional.of(issue));

        issueService.deleteIssue(1L, 1L);

        verify(issueRepository).delete(issue);
    }
}
