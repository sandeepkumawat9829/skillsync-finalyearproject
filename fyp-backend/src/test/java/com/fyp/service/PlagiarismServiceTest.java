package com.fyp.service;

import com.fyp.model.entity.Project;
import com.fyp.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlagiarismService Tests")
class PlagiarismServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private PlagiarismService plagiarismService;

    private Project mainProject;
    private Project otherProject;

    @BeforeEach
    void setUp() {
        mainProject = Project.builder()
                .id(1L)
                .title("Main Project")
                .abstractText("This is a test abstract for plagiarism detection.")
                .build();

        otherProject = Project.builder()
                .id(2L)
                .title("Other Project")
                .abstractText("This is a different abstract.")
                .build();
    }

    @Test
    @DisplayName("Check Similarity - Identical abstracts should have 100% similarity")
    void checkSimilarity_IdenticalAbstracts() {
        otherProject.setAbstractText(mainProject.getAbstractText());
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mainProject));
        when(projectRepository.findAll()).thenReturn(Collections.singletonList(otherProject));

        Map<String, Object> result = plagiarismService.checkSimilarity(1L);

        assertEquals(100.0, (Double) result.get("similarityScore"), 0.1);
        assertEquals("HIGH_SIMILARITY", result.get("status"));
    }

    @Test
    @DisplayName("Check Similarity - Different abstracts should have low similarity")
    void checkSimilarity_DifferentAbstracts() {
        // "This is a test abstract for plagiarism detection." vs "Completely unrelated
        // content here."
        // Tokens 1: this, test, abstract, plagiarism, detection
        // Tokens 2: completely, unrelated, content, here
        // Intersection: 0
        otherProject.setAbstractText("Completely unrelated content here.");
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mainProject));
        when(projectRepository.findAll()).thenReturn(Collections.singletonList(otherProject));

        Map<String, Object> result = plagiarismService.checkSimilarity(1L);

        assertEquals(0.0, (Double) result.get("similarityScore"), 0.1);
        assertEquals("LOW_SIMILARITY", result.get("status"));
    }

    @Test
    @DisplayName("Check Similarity - Partial overlap should have moderate similarity")
    void checkSimilarity_PartialOverlap() {
        // "This is a test abstract for plagiarism detection." (5 relevant tokens)
        // "This is a test abstract for something else." (4 relevant tokens: this, test,
        // abstract, something)
        // Intersection: "this", "test", "abstract" (3 tokens) -> Note: 'this' might be
        // filtered if length <= 3?
        // Service filter: length > 3.
        // Text 1 tokens: "test", "abstract", "plagiarism", "detection" (4 tokens)
        // Text 2 tokens: "test", "abstract", "something", "else" (4 tokens)
        // Intersection: "test", "abstract" (2 tokens)
        // Union: "test", "abstract", "plagiarism", "detection", "something", "else" (6
        // tokens)
        // Similarity: 2/6 = 33.33%

        otherProject.setAbstractText("This is a test abstract for something else.");
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mainProject));
        when(projectRepository.findAll()).thenReturn(Collections.singletonList(otherProject));

        Map<String, Object> result = plagiarismService.checkSimilarity(1L);

        double score = (Double) result.get("similarityScore");
        assertTrue(score > 20.0 && score < 50.0, "Score should be between 20% and 50%, actual: " + score);
        // Status might be LOW or MODERATE depending on threshold (40 is cut off for
        // MODERATE)
    }

    @Test
    @DisplayName("Check Similarity - Should handle missing abstract")
    void checkSimilarity_MissingAbstract() {
        mainProject.setAbstractText(null);
        when(projectRepository.findById(1L)).thenReturn(Optional.of(mainProject));

        Map<String, Object> result = plagiarismService.checkSimilarity(1L);

        assertEquals(0.0, result.get("similarityScore"));
        assertEquals("NO_ABSTRACT", result.get("status"));
    }

    @Test
    @DisplayName("Check Similarity - Should throw if project not found")
    void checkSimilarity_NotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> plagiarismService.checkSimilarity(1L));
    }
}
