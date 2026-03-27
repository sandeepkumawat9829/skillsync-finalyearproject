package com.fyp.repository;

import com.fyp.model.entity.ProjectTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectTemplateRepository extends JpaRepository<ProjectTemplate, Long> {

    List<ProjectTemplate> findByIsActiveTrueOrderByTemplateNameAsc();

    List<ProjectTemplate> findByDomainAndIsActiveTrue(String domain);

    List<ProjectTemplate> findByDomainInAndIsActiveTrue(List<String> domains);
}
