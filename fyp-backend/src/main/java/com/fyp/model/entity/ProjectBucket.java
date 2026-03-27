package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "college_project_buckets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectBucket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bucketId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    private String department;

    @ElementCollection
    @CollectionTable(name = "bucket_technologies", joinColumns = @JoinColumn(name = "bucket_id"))
    @Column(name = "technology")
    private List<String> technologies;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DifficultyLevel difficultyLevel = DifficultyLevel.MEDIUM;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxTeams = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer allocatedTeams = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by")
    private User postedBy;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime postedAt = LocalDateTime.now();

    private LocalDateTime deadline;

    public enum DifficultyLevel {
        EASY, MEDIUM, HARD
    }

    public boolean hasAvailableSlots() {
        return allocatedTeams < maxTeams;
    }
}
