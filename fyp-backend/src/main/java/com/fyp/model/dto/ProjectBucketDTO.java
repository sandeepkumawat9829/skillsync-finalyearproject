package com.fyp.model.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectBucketDTO {
    private Long bucketId;
    private String title;
    private String description;
    private String department;
    private List<String> technologies;
    private String difficultyLevel;
    private Integer maxTeams;
    private Integer allocatedTeams;
    private Integer availableSlots;
    private Boolean isAvailable;
    private Long postedById;
    private String postedByName;
    private LocalDateTime postedAt;
    private LocalDateTime deadline;
}
