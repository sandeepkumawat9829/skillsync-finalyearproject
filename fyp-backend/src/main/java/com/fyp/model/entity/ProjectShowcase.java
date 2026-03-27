package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.Builder.Default;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_showcase")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectShowcase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "showcase_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @Default
    @Column(name = "is_published")
    private Boolean isPublished = false;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "demo_video_url", length = 500)
    private String demoVideoUrl;

    @Column(name = "presentation_url", length = 500)
    private String presentationUrl;

    @Column(name = "live_demo_url", length = 500)
    private String liveDemoUrl;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @ElementCollection
    @CollectionTable(name = "showcase_awards", joinColumns = @JoinColumn(name = "showcase_id"))
    @Column(name = "award")
    @Default
    private List<String> awards = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "showcase_tags", joinColumns = @JoinColumn(name = "showcase_id"))
    @Column(name = "tag")
    @Default
    private List<String> tags = new ArrayList<>();

    @Default
    @Column(name = "views_count")
    private Integer viewsCount = 0;

    @Default
    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Default
    @OneToMany(mappedBy = "showcase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShowcaseLike> likes = new ArrayList<>();
}
