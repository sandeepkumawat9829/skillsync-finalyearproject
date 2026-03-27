package com.fyp.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "showcase_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "showcase_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowcaseLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showcase_id", nullable = false)
    private ProjectShowcase showcase;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
