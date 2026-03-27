package com.fyp.repository;

import com.fyp.model.entity.Document;
import com.fyp.model.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.uploadedBy LEFT JOIN FETCH d.approvedBy WHERE d.project.id = :projectId ORDER BY d.uploadedAt DESC")
    List<Document> findByProjectIdWithDetails(Long projectId);

    @Query("SELECT d FROM Document d LEFT JOIN FETCH d.uploadedBy LEFT JOIN FETCH d.approvedBy WHERE d.id = :id")
    Optional<Document> findByIdWithDetails(Long id);

    List<Document> findByProjectIdAndStatus(Long projectId, DocumentStatus status);

    List<Document> findByUploadedById(Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.project.id = :projectId")
    long countByProjectId(Long projectId);
}
