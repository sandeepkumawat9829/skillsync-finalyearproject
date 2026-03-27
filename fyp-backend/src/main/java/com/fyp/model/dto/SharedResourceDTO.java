package com.fyp.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedResourceDTO {
    private Long resourceId;
    private Long sharedById;
    private String sharedByName;
    private Long teamId;
    private String resourceTitle;
    private String resourceType;
    private String resourceUrl;
    private String description;
    private String projectPhase;
    private LocalDateTime createdAt;
}
