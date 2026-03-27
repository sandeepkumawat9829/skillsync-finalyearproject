package com.fyp.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueCommentDTO {
    private Long id;
    private Long issueId;
    private Long userId;
    private String userName;

    @NotBlank(message = "Comment text is required")
    private String commentText;

    private LocalDateTime createdAt;
}
