package com.fyp.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CollegeProjectBucketDTO {
    private Long bucketId;
    private String title;
    private String description;
    private String department;
    private List<String> technologies;
    private String difficultyLevel;
    private Integer maxTeams;
    private Integer allocatedTeams;
    private Boolean isAvailable;
    private Long postedBy;
    private LocalDateTime postedAt;
    private LocalDateTime deadline;
}
