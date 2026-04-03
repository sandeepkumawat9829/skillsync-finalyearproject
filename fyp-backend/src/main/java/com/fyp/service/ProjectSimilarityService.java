package com.fyp.service;

import com.fyp.model.entity.Project;
import com.fyp.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectSimilarityService {

    private final ProjectRepository projectRepository;

    /**
     * Checks how similar a new project is to existing projects using TF-IDF and Cosine Similarity.
     * High similarity (> 85%) means it's likely a duplicate.
     * Medium-High similarity (60% - 85%) means it might be a duplicate, user should be warned.
     * @return List of similar projects with their similarity scores, sorted descending.
     */
    public List<Map<String, Object>> checkDuplicateBeforeCreation(String title, String abstractText) {
        String newProjectText = (title + " " + abstractText).toLowerCase();
        List<Project> existingProjects = projectRepository.findAll();

        if (existingProjects.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Build Document Corpus & Tokenize
        List<String[]> documents = new ArrayList<>();
        documents.add(tokenize(newProjectText)); // Index 0 is the new project

        for (Project p : existingProjects) {
            String pText = (p.getTitle() + " " + p.getAbstractText()).toLowerCase();
            documents.add(tokenize(pText));
        }

        // 2. Calculate TF-IDF
        List<Map<String, Double>> tfidfDocs = calculateTFIDF(documents);

        // 3. Calculate Cosine Similarity against the new project (Index 0)
        Map<String, Double> newProjectTfidf = tfidfDocs.get(0);
        List<Map<String, Object>> similarProjects = new ArrayList<>();

        for (int i = 1; i < tfidfDocs.size(); i++) {
            double similarity = cosineSimilarity(newProjectTfidf, tfidfDocs.get(i));
            if (similarity > 0.60) { // Only keep if similarity > 60%
                Project matchingProject = existingProjects.get(i - 1);
                Map<String, Object> result = new HashMap<>();
                result.put("projectId", matchingProject.getId());
                result.put("title", matchingProject.getTitle());
                result.put("similarityScore", Math.round(similarity * 100)); // Convert to percentage
                similarProjects.add(result);
            }
        }

        // Sort by highest similarity first
        similarProjects.sort((a, b) -> Long.compare((Long) b.get("similarityScore"), (Long) a.get("similarityScore")));
        return similarProjects;
    }

    private String[] tokenize(String text) {
        // Remove punctuation and split by whitespace
        return text.replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");
    }

    private List<Map<String, Double>> calculateTFIDF(List<String[]> documents) {
        // Calculate Document Frequency (DF)
        Map<String, Integer> df = new HashMap<>();
        for (String[] doc : documents) {
            Set<String> uniqueTerms = new HashSet<>(Arrays.asList(doc));
            for (String term : uniqueTerms) {
                df.put(term, df.getOrDefault(term, 0) + 1);
            }
        }

        int N = documents.size();
        List<Map<String, Double>> tfidfDocs = new ArrayList<>();

        for (String[] doc : documents) {
            Map<String, Double> tf = new HashMap<>();
            // Calculate Term Frequency (TF)
            for (String term : doc) {
                tf.put(term, tf.getOrDefault(term, 0.0) + 1.0);
            }
            
            // Calculate TF-IDF
            Map<String, Double> tfidf = new HashMap<>();
            for (Map.Entry<String, Double> entry : tf.entrySet()) {
                String term = entry.getKey();
                double termFreq = entry.getValue() / doc.length;
                double idf = Math.log((double) N / (1 + df.getOrDefault(term, 0))); // Smoothing
                tfidf.put(term, termFreq * idf);
            }
            tfidfDocs.add(tfidf);
        }

        return tfidfDocs;
    }

    private double cosineSimilarity(Map<String, Double> vec1, Map<String, Double> vec2) {
        Set<String> intersection = new HashSet<>(vec1.keySet());
        intersection.retainAll(vec2.keySet());

        double dotProduct = 0.0;
        for (String term : intersection) {
            dotProduct += vec1.get(term) * vec2.get(term);
        }

        double norm1 = 0.0;
        for (double val : vec1.values()) {
            norm1 += val * val;
        }

        double norm2 = 0.0;
        for (double val : vec2.values()) {
            norm2 += val * val;
        }

        if (norm1 == 0.0 || norm2 == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
