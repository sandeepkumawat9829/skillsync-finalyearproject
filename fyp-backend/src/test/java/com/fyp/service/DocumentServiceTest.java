package com.fyp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.UnauthorizedException;
import com.fyp.model.dto.DocumentDTO;
import com.fyp.model.entity.Document;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.User;
import com.fyp.model.enums.DocumentStatus;
import com.fyp.model.enums.DocumentType;
import com.fyp.model.enums.Role;
import com.fyp.repository.DocumentRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentService Tests")
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private DocumentService documentService;

    private User student;
    private User mentor;
    private Project project;
    private Document document;

    @BeforeEach
    void setUp() {
        student = User.builder()
                .id(1L)
                .email("student@example.com")
                .role(Role.STUDENT)
                .build();

        mentor = User.builder()
                .id(2L)
                .email("mentor@example.com")
                .role(Role.MENTOR)
                .build();

        project = Project.builder()
                .id(1L)
                .title("Project 1")
                .build();

        document = Document.builder()
                .id(1L)
                .project(project)
                .uploadedBy(student)
                .fileName("test_file")
                .originalFileName("test.pdf")
                .cloudinaryPublicId("test_public_id")
                .status(DocumentStatus.PENDING)
                .build();
    }

    @Test
    @DisplayName("Upload Document - Should upload to Cloudinary and save")
    void uploadDocument_ShouldUploadAndSave() throws IOException {
        // Given
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getOriginalFilename()).thenReturn("test.pdf");
        when(file.getBytes()).thenReturn(new byte[] { 1, 2, 3 });

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));

        when(cloudinary.uploader()).thenReturn(uploader);
        Map<String, Object> uploadResult = new HashMap<>();
        uploadResult.put("public_id", "test_id");
        uploadResult.put("secure_url", "http://url");
        when(uploader.upload(any(), any())).thenReturn(uploadResult);

        when(documentRepository.save(any(Document.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        DocumentDTO result = documentService.uploadDocument(1L, file, DocumentType.REPORT, "Desc", 1L);

        // Then
        assertNotNull(result);
        assertEquals("test_id", result.getFileName());
        verify(uploader, times(1)).upload(any(), any());
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    @DisplayName("Upload Document - Should fail if invalid extension")
    void uploadDocument_ShouldFailIfInvalidExtension() {
        // Given
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getSize()).thenReturn(1024L);
        when(file.getOriginalFilename()).thenReturn("test.exe");

        // When & Then
        assertThrows(BusinessRuleViolationException.class,
                () -> documentService.uploadDocument(1L, file, DocumentType.REPORT, "Desc", 1L));
    }

    @Test
    @DisplayName("Approve Document - Should approve when done by mentor")
    void approveDocument_ShouldApproveWhenMentor() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(userRepository.findById(2L)).thenReturn(Optional.of(mentor));
        when(documentRepository.save(any(Document.class))).thenReturn(document);

        // When
        DocumentDTO result = documentService.approveDocument(1L, 2L);

        // Then
        assertEquals(DocumentStatus.APPROVED, result.getStatus());
        assertEquals(2L, result.getApprovedById());
    }

    @Test
    @DisplayName("Approve Document - Should fail when done by student")
    void approveDocument_ShouldFailWhenStudent() {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));

        // When & Then
        assertThrows(UnauthorizedException.class, () -> documentService.approveDocument(1L, 1L));
    }

    @Test
    @DisplayName("Delete Document - Should delete from Cloudinary and DB")
    void deleteDocument_ShouldDelete() throws IOException {
        // Given
        when(documentRepository.findById(1L)).thenReturn(Optional.of(document));
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(cloudinary.uploader()).thenReturn(uploader);

        // When
        documentService.deleteDocument(1L, 1L);

        // Then
        verify(uploader, times(1)).destroy(eq("test_public_id"), any());
        verify(documentRepository, times(1)).delete(document);
    }
}
