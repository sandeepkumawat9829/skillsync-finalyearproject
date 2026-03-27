package com.fyp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fyp.model.dto.GitHubCommitDTO;
import com.fyp.model.dto.GitHubStatsDTO;
import com.fyp.model.entity.GitHubCommit;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.User;
import com.fyp.repository.GitHubCommitRepository;
import com.fyp.repository.ProjectRepository;
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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GitHubService Tests")
class GitHubServiceTest {

    @Mock
    private GitHubCommitRepository commitRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private GitHubService gitHubService;

    private Project project;
    private GitHubCommit commit;
    private User user;

    @BeforeEach
    void setUp() {
        project = Project.builder()
                .id(1L)
                .title("Test Project")
                .githubRepoUrl("https://github.com/user/repo")
                .build();

        user = User.builder()
                .id(1L)
                .email("dev@test.com")
                .build();

        commit = GitHubCommit.builder()
                .id(1L)
                .project(project)
                .commitHash("sha123")
                .commitMessage("Initial commit")
                .authorName("Dev User")
                .authorEmail("dev@test.com")
                .committedAt(LocalDateTime.now())
                .linesAdded(10)
                .linesDeleted(5)
                .filesChanged(2)
                .build();
    }

    @Test
    @DisplayName("Sync Commits - Should fetch and save new commits")
    void syncCommits_ShouldFetchAndSave() throws JsonProcessingException {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        // Mock GitHub API Response
        String jsonResponse = "[{\"sha\": \"sha123\", \"commit\": {\"message\": \"msg\", \"author\": {\"name\": \"name\", \"email\": \"email\", \"date\": \"2023-01-01T12:00:00Z\"}}, \"stats\": {\"additions\": 10, \"deletions\": 5, \"total\": 15}}]";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(jsonResponse, HttpStatus.OK);

        // Make mock specific to the first call so the second call (details fetch) falls
        // into catch block
        when(restTemplate.exchange(contains("?per_page=100"), eq(HttpMethod.GET), any(HttpEntity.class),
                eq(String.class)))
                .thenReturn(responseEntity);

        // Mock ObjectMapper behavior
        JsonNode rootNode = mock(JsonNode.class);
        when(objectMapper.readTree(jsonResponse)).thenReturn(rootNode);
        JsonNode commitNode = mock(JsonNode.class);
        when(rootNode.iterator()).thenReturn(Collections.singletonList(commitNode).iterator());

        // Create mock nodes first to avoid nested stubbing state issues
        JsonNode shaNode = mockTextNode("sha123");
        JsonNode msgNode = mockTextNode("msg");
        JsonNode nameNode = mockTextNode("name");
        JsonNode emailNode = mockTextNode("email");
        JsonNode dateNode = mockTextNode("2023-01-01T12:00:00Z");
        JsonNode additionsNode = mockIntNode(10);
        JsonNode deletionsNode = mockIntNode(5);
        JsonNode totalNode = mockIntNode(15);

        when(commitNode.get("sha")).thenReturn(shaNode);

        // Mock commit data structure access
        JsonNode commitData = mock(JsonNode.class);
        JsonNode authorData = mock(JsonNode.class);
        JsonNode statsData = mock(JsonNode.class);

        when(commitNode.get("commit")).thenReturn(commitData);
        when(commitNode.get("stats")).thenReturn(statsData);
        when(commitData.get("message")).thenReturn(msgNode);
        when(commitData.get("author")).thenReturn(authorData);
        when(authorData.get("name")).thenReturn(nameNode);
        when(authorData.get("email")).thenReturn(emailNode);
        when(authorData.get("date")).thenReturn(dateNode);
        when(statsData.get("additions")).thenReturn(additionsNode);
        when(statsData.get("deletions")).thenReturn(deletionsNode);
        when(statsData.get("total")).thenReturn(totalNode);

        when(commitRepository.existsByProjectIdAndCommitHash(1L, "sha123")).thenReturn(false);

        int result = gitHubService.syncCommits(1L);

        assertEquals(1, result);
        verify(commitRepository).save(any(GitHubCommit.class));
    }

    @Test
    @DisplayName("Get Project Stats - Should return stats DTO")
    void getProjectStats_ShouldReturnStats() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(commitRepository.countByProjectId(1L)).thenReturn(10L);
        when(commitRepository.sumLinesAddedByProjectId(1L)).thenReturn(100L);
        when(commitRepository.sumLinesDeletedByProjectId(1L)).thenReturn(50L);

        List<Object[]> authorStats = new ArrayList<>();
        authorStats.add(new Object[] { "dev@test.com", 10L });
        when(commitRepository.countCommitsByAuthor(1L)).thenReturn(authorStats);

        when(commitRepository.findRecentCommits(eq(1L), any(LocalDateTime.class)))
                .thenReturn(Collections.singletonList(commit));

        GitHubStatsDTO result = gitHubService.getProjectStats(1L);

        assertNotNull(result);
        assertEquals(10L, result.getTotalCommits());
        assertEquals(100L, result.getTotalLinesAdded());
        assertEquals(50L, result.getTotalLinesDeleted());
        assertEquals(50L, result.getNetLinesOfCode());
        assertEquals(1, result.getTopContributors().size());
        assertEquals(1, result.getRecentCommits().size());
    }

    @Test
    @DisplayName("Get Project Commits - Should return paged list")
    void getProjectCommits_ShouldReturnList() {
        Page<GitHubCommit> page = new PageImpl<>(Collections.singletonList(commit));
        when(commitRepository.findByProjectIdOrderByCommittedAtDesc(eq(1L), any(PageRequest.class)))
                .thenReturn(page);

        List<GitHubCommitDTO> result = gitHubService.getProjectCommits(1L, 0, 10);

        assertEquals(1, result.size());
        assertEquals("sha123", result.get(0).getCommitHash());
    }

    // Helper methods for mocking JsonNode
    private JsonNode mockTextNode(String text) {
        JsonNode node = mock(JsonNode.class);
        when(node.asText()).thenReturn(text);
        return node;
    }

    private JsonNode mockIntNode(int value) {
        JsonNode node = mock(JsonNode.class);
        when(node.asInt()).thenReturn(value);
        return node;
    }
}
