package com.fyp.controller;

import com.fyp.model.dto.DocumentDTO;
import com.fyp.model.dto.FormGenerateRequest;
import com.fyp.model.enums.DocumentType;
import com.fyp.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import com.fyp.repository.UserRepository;
import com.fyp.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document upload and management APIs")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get all documents for a project")
    public ResponseEntity<List<DocumentDTO>> getDocumentsByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(documentService.getDocumentsByProject(projectId, userId));
    }

    @GetMapping("/{documentId}")
    @Operation(summary = "Get document by ID")
    public ResponseEntity<DocumentDTO> getDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(documentService.getDocument(documentId, userId));
    }

    @PostMapping(value = "/project/{projectId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document to a project")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @PathVariable Long projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        // For now, use a placeholder user ID - in real app, get from UserDetails
        Long userId = getUserIdFromUserDetails(userDetails);

        DocumentDTO document = documentService.uploadDocument(projectId, file, documentType, description, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(document);
    }

    @PostMapping(value = "/project/{projectId}/generate/{formType}")
    @Operation(summary = "Generate and upload Form-1/2/3 as PDF (team leader only)")
    public ResponseEntity<DocumentDTO> generateForm(
            @PathVariable Long projectId,
            @PathVariable String formType,
            @RequestBody(required = false) FormGenerateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        Long userId = getUserIdFromUserDetails(userDetails);
        DocumentType type = switch (formType.toLowerCase()) {
            case "form1", "form-1" -> DocumentType.FORM_1_ABSTRACT;
            case "form2", "form-2" -> DocumentType.FORM_2_ROLE_SPECIFICATION;
            case "form3", "form-3" -> DocumentType.FORM_3_WEEKLY_STATUS_MATRIX;
            default -> throw new RuntimeException("Unsupported formType: " + formType);
        };

        FormGenerateRequest safeReq = request != null ? request : new FormGenerateRequest();
        DocumentDTO doc = documentService.generateAndUploadForm(projectId, type, safeReq, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @PostMapping("/{documentId}/approve")
    @Operation(summary = "Approve a document (mentor only)")
    public ResponseEntity<DocumentDTO> approveDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long mentorId = getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(documentService.approveDocument(documentId, mentorId));
    }

    @PostMapping("/{documentId}/reject")
    @Operation(summary = "Reject a document (mentor only)")
    public ResponseEntity<DocumentDTO> rejectDocument(
            @PathVariable Long documentId,
            @RequestBody RejectRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long mentorId = getUserIdFromUserDetails(userDetails);
        return ResponseEntity.ok(documentService.rejectDocument(documentId, mentorId, request.getReason()));
    }

    @DeleteMapping("/{documentId}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        Long userId = getUserIdFromUserDetails(userDetails);
        documentService.deleteDocument(documentId, userId);
        return ResponseEntity.noContent().build();
    }

    // Helper method to extract user ID from UserDetails
    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()))
                .getId();
    }

    // Request body for reject operation
    @lombok.Data
    public static class RejectRequest {
        private String reason;
    }
}
