package com.fyp.model.dto;

import com.fyp.model.enums.DocumentStatus;
import com.fyp.model.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    private Long id;
    private Long projectId;
    private DocumentType documentType;
    private String fileName;
    private String originalFileName;
    private Long fileSize;
    private String fileUrl;
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private Integer version;
    private String description;
    private DocumentStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
}
