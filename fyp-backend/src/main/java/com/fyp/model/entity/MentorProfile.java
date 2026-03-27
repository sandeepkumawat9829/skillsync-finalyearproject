package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "mentor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "employee_id", unique = true, nullable = false)
    private String employeeId;

    @Column(nullable = false)
    private String department;

    private String designation;

    @ElementCollection
    @CollectionTable(name = "mentor_profile_specializations", joinColumns = @JoinColumn(name = "mentor_id"))
    @Column(name = "specialization")
    private List<String> specializations;

    @Default
    @Column(name = "max_projects_allowed")
    private Integer maxProjectsAllowed = 5;

    @Default
    @Column(name = "current_project_count")
    private Integer currentProjectCount = 0;

    private String phone;

    @Column(name = "office_location")
    private String officeLocation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
