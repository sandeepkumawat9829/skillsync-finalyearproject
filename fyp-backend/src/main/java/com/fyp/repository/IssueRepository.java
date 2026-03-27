package com.fyp.repository;

import com.fyp.model.entity.Issue;
import com.fyp.model.enums.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue> findByProjectId(Long projectId);

    List<Issue> findByProjectIdAndStatus(Long projectId, IssueStatus status);

    List<Issue> findByAssignedToId(Long userId);

    List<Issue> findByReportedById(Long userId);

    long countByProjectIdAndStatus(Long projectId, IssueStatus status);
}
