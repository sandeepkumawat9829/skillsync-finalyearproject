package com.fyp.repository;

import com.fyp.model.entity.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByUserId(Long userId);

    Optional<MentorProfile> findByEmployeeId(String employeeId);

    List<MentorProfile> findByDepartment(String department);

    List<MentorProfile> findByCurrentProjectCountLessThan(Integer count);

    boolean existsByEmployeeId(String employeeId);
}
