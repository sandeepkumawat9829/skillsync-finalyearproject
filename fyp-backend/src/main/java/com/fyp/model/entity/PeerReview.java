package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "peer_reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "project_id", "reviewer_id", "reviewee_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    @Column(name = "technical_skills_rating")
    private Integer technicalSkillsRating;

    @Column(name = "communication_rating")
    private Integer communicationRating;

    @Column(name = "teamwork_rating")
    private Integer teamworkRating;

    @Column(name = "problem_solving_rating")
    private Integer problemSolvingRating;

    @Column(name = "overall_contribution_rating")
    private Integer overallContributionRating;

    @Column(name = "anonymous_feedback", columnDefinition = "TEXT")
    private String anonymousFeedback;

    @Builder.Default
    @Column(name = "is_anonymous")
    private Boolean isAnonymous = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
