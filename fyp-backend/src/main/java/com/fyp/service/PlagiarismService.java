package com.fyp.service;

import com.fyp.model.entity.Project;
import com.fyp.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlagiarismService {

    private final ProjectRepository projectRepository;

    /**
     * Check similarity of a project abstract against all other projects
     * Returns similarity percentage (0-100)
     */
    public Map<String, Object> checkSimilarity(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String abstract_ = project.getAbstractText();
        if (abstract_ == null || abstract_.isBlank()) {
            return Map.of(
                    "projectId", projectId,
                    "similarityScore", 0.0,
                    "similarProjects", List.of(),
                    "status", "NO_ABSTRACT");
        }

        List<Project> allProjects = projectRepository.findAll().stream()
                .filter(p -> !p.getId().equals(projectId))
                .filter(p -> p.getAbstractText() != null && !p.getAbstractText().isBlank())
                .collect(Collectors.toList());

        List<Map<String, Object>> similarProjects = new ArrayList<>();
        double maxSimilarity = 0;

        for (Project other : allProjects) {
            double similarity = calculateJaccardSimilarity(abstract_, other.getAbstractText());
            if (similarity > 20) { // Only report if > 20% similar
                similarProjects.add(Map.of(
                        "projectId", other.getId(),
                        "projectTitle", other.getTitle(),
                        "similarity", Math.round(similarity * 100.0) / 100.0));
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                }
            }
        }

        // Sort by similarity descending
        similarProjects.sort((a, b) -> Double.compare(
                (Double) b.get("similarity"),
                (Double) a.get("similarity")));

        String status;
        if (maxSimilarity > 70) {
            status = "HIGH_SIMILARITY";
        } else if (maxSimilarity > 40) {
            status = "MODERATE_SIMILARITY";
        } else {
            status = "LOW_SIMILARITY";
        }

        return Map.of(
                "projectId", projectId,
                "similarityScore", Math.round(maxSimilarity * 100.0) / 100.0,
                "similarProjects", similarProjects.stream().limit(5).collect(Collectors.toList()),
                "status", status);
    }

    /**
     * Calculate Jaccard similarity between two texts
     */
    private double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> words1 = tokenize(text1);
        Set<String> words2 = tokenize(text2);

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0;
        }

        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);

        return (double) intersection.size() / union.size() * 100;
    }

    /**
     * Tokenize text into unique words (normalized)
     */
    private Set<String> tokenize(String text) {
        return Arrays.stream(text.toLowerCase()
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .split("\\s+"))
                .map(String::trim)
                .filter(s -> s.length() > 3) // Ignore short words
                .collect(Collectors.toSet());
    }
}
