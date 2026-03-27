package com.fyp.repository;

import com.fyp.model.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);

    Optional<StudentProfile> findByEnrollmentNumber(String enrollmentNumber);

    List<StudentProfile> findByBranch(String branch);

    boolean existsByEnrollmentNumber(String enrollmentNumber);
}
