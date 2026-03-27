package com.fyp.repository;

import com.fyp.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectIdOrderByColumnNameAscPositionAscCreatedAtAsc(Long projectId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findBySprintIdOrderByColumnNameAscPositionAscCreatedAtAsc(Long sprintId);

    List<Task> findByProjectIdAndColumnName(Long projectId, String columnName);

    List<Task> findByProjectIdAndColumnNameOrderByPositionAscCreatedAtAsc(Long projectId, String columnName);

    @Query("select coalesce(max(t.position), -1) from Task t where t.project.id = :projectId and t.columnName = :columnName")
    Integer findMaxPositionByProjectIdAndColumnName(@Param("projectId") Long projectId, @Param("columnName") String columnName);
}
