package com.fyp.model.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDTO {
    private Long announcementId;
    private Long postedById;
    private String postedByName;
    private String title;
    private String content;
    private String announcementType;
    private String targetAudience;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
