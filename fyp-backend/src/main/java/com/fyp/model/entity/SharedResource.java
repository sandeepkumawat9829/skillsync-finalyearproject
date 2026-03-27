package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_by", nullable = false)
    private User sharedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "resource_title", nullable = false)
    private String resourceTitle;

    @Column(name = "resource_type", length = 50)
    private String resourceType; // ARTICLE, RESEARCH_PAPER, TUTORIAL, VIDEO, TOOL, OTHER

    @Column(name = "resource_url", length = 500)
    private String resourceUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "project_phase", length = 50)
    private String projectPhase; // PLANNING, DESIGN, DEVELOPMENT, TESTING

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
