package com.fyp.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.exception.UnauthorizedException;
import com.fyp.model.dto.DocumentDTO;
import com.fyp.model.entity.Document;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.TeamMember;
import com.fyp.model.entity.User;
import com.fyp.model.enums.DocumentStatus;
import com.fyp.model.enums.DocumentType;
import com.fyp.model.enums.Role;
import com.fyp.repository.DocumentRepository;
import com.fyp.repository.MentorAssignmentRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final Cloudinary cloudinary;
    private final PdfFormService pdfFormService;
    private final EmailService emailService;
    private final StudentProfileRepository studentProfileRepository;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "doc", "docx", "ppt", "pptx");

    @Transactional(readOnly = true)
    public List<DocumentDTO> getDocumentsByProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        validateProjectAccess(project, userId);
        List<Document> documents = documentRepository.findByProjectIdWithDetails(projectId);
        return documents.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDTO getDocument(Long documentId, Long userId) {
        Document document = documentRepository.findByIdWithDetails(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
        validateProjectAccess(document.getProject(), userId);
        return toDTO(document);
    }

    @Transactional
    public DocumentDTO uploadDocument(Long projectId, MultipartFile file, DocumentType documentType,
            String description, Long userId) throws IOException {
        // Validate file
        validateFile(file);

        // Get project and user
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        validateCanUploadDocument(project, userId, documentType);

        // Upload to Cloudinary
        Map uploadResult = uploadToCloudinary(file, projectId);

        // Create document entity
        Document document = Document.builder()
                .project(project)
                .documentType(documentType)
                .fileName((String) uploadResult.get("public_id"))
                .originalFileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .fileUrl((String) uploadResult.get("secure_url"))
                .cloudinaryPublicId((String) uploadResult.get("public_id"))
                .uploadedBy(user)
                .version(1)
                .description(description)
                .status(DocumentStatus.PENDING)
                .build();

        Document savedDocument = documentRepository.save(document);
        log.info("Document uploaded: {} by user {}", savedDocument.getOriginalFileName(), userId);

        return toDTO(savedDocument);
    }

    @Transactional
    public DocumentDTO generateAndUploadForm(Long projectId, DocumentType type, com.fyp.model.dto.FormGenerateRequest req, Long userId) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        validateCanUploadDocument(project, userId, type);

        Team team = teamRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "projectId", projectId));
        List<TeamMember> members = teamMemberRepository.findByTeamId(team.getId());

        byte[] pdfBytes = switch (type) {
            case FORM_1_ABSTRACT -> pdfFormService.generateForm1(project, team, members, req);
            case FORM_2_ROLE_SPECIFICATION -> pdfFormService.generateForm2(project, team, members, req);
            case FORM_3_WEEKLY_STATUS_MATRIX -> pdfFormService.generateForm3(project, team, members, req);
            default -> throw new BusinessRuleViolationException("Unsupported generated form type: " + type);
        };

        String originalFileName = switch (type) {
            case FORM_1_ABSTRACT -> "Form-1_Project_Abstract.pdf";
            case FORM_2_ROLE_SPECIFICATION -> "Form-2_Role_Specification.pdf";
            case FORM_3_WEEKLY_STATUS_MATRIX -> "Form-3_Weekly_Status_Matrix.pdf";
            default -> "Form.pdf";
        };

        Map uploadResult = uploadBytesToCloudinary(pdfBytes, projectId, originalFileName);

        Document document = Document.builder()
                .project(project)
                .documentType(type)
                .fileName((String) uploadResult.get("public_id"))
                .originalFileName(originalFileName)
                .fileSize((long) pdfBytes.length)
                .fileUrl((String) uploadResult.get("secure_url"))
                .cloudinaryPublicId((String) uploadResult.get("public_id"))
                .uploadedBy(user)
                .version(1)
                .description("System-generated " + type.name())
                .status(DocumentStatus.PENDING)
                .build();

        Document savedDocument = documentRepository.save(document);

        // Notify the user via email
        String userName = studentProfileRepository.findByUserId(userId)
                .map(com.fyp.model.entity.StudentProfile::getFullName)
                .orElse(user.getEmail());
        emailService.sendDocumentGeneratedEmail(
                user.getEmail(),
                userName,
                originalFileName,
                project.getTitle()
        );

        return toDTO(savedDocument);
    }

    private void validateCanUploadDocument(Project project, Long userId, DocumentType documentType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        // For submissions we enforce team leader only
        Team team = teamRepository.findByProjectId(project.getId()).orElse(null);
        if (team == null) {
            throw new UnauthorizedException("upload", "project documents");
        }

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        if (!isLeader) {
            throw new UnauthorizedException("Only team leader can upload project submissions");
        }
    }

    @Transactional
    public DocumentDTO approveDocument(Long documentId, Long mentorId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorId));

        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only mentors can approve documents");
        }

        document.setStatus(DocumentStatus.APPROVED);
        document.setApprovedBy(mentor);
        document.setApprovedAt(LocalDateTime.now());

        Document savedDocument = documentRepository.save(document);
        log.info("Document {} approved by mentor {}", documentId, mentorId);

        return toDTO(savedDocument);
    }

    @Transactional
    public DocumentDTO rejectDocument(Long documentId, Long mentorId, String reason) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", mentorId));

        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only mentors can reject documents");
        }

        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionReason(reason);

        Document savedDocument = documentRepository.save(document);
        log.info("Document {} rejected by mentor {}: {}", documentId, mentorId, reason);

        return toDTO(savedDocument);
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) throws IOException {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Only owner or admin can delete
        if (!document.getUploadedBy().getId().equals(userId) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("You can only delete your own documents");
        }

        // Delete from Cloudinary
        if (document.getCloudinaryPublicId() != null) {
            try {
                cloudinary.uploader().destroy(document.getCloudinaryPublicId(), ObjectUtils.emptyMap());
            } catch (Exception e) {
                log.warn("Failed to delete from Cloudinary: {}", e.getMessage());
            }
        }

        documentRepository.delete(document);
        log.info("Document {} deleted by user {}", documentId, userId);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessRuleViolationException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleViolationException("File size exceeds 10 MB limit");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessRuleViolationException("File name is required");
        }

        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessRuleViolationException(
                    "Invalid file type. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private Map uploadToCloudinary(MultipartFile file, Long projectId) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "fyp-documents/project-" + projectId,
                "resource_type", "auto"));
    }

    private Map uploadBytesToCloudinary(byte[] bytes, Long projectId, String filename) throws IOException {
        return cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                "folder", "fyp-documents/project-" + projectId,
                "resource_type", "raw",
                "filename_override", filename,
                "use_filename", true,
                "unique_filename", true));
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }

    private DocumentDTO toDTO(Document document) {
        return DocumentDTO.builder()
                .id(document.getId())
                .projectId(document.getProject().getId())
                .documentType(document.getDocumentType())
                .fileName(document.getFileName())
                .originalFileName(document.getOriginalFileName())
                .fileSize(document.getFileSize())
                .fileUrl(document.getFileUrl())
                .uploadedById(document.getUploadedBy().getId())
                .uploadedByName(document.getUploadedBy().getEmail())
                .uploadedAt(document.getUploadedAt())
                .version(document.getVersion())
                .description(document.getDescription())
                .status(document.getStatus())
                .approvedById(document.getApprovedBy() != null ? document.getApprovedBy().getId() : null)
                .approvedByName(document.getApprovedBy() != null ? document.getApprovedBy().getEmail() : null)
                .approvedAt(document.getApprovedAt())
                .rejectionReason(document.getRejectionReason())
                .build();
    }

    private void validateProjectAccess(Project project, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
            return;
        }

        Team team = teamRepository.findByProjectId(project.getId()).orElse(null);
        if (team == null) {
            throw new UnauthorizedException("view", "project documents");
        }

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId);
        boolean isAssignedMentor = mentorAssignmentRepository.findByTeamId(team.getId())
                .map(assignment -> assignment.getMentor() != null && assignment.getMentor().getId().equals(userId))
                .orElse(false);

        if (!isLeader && !isMember && !isAssignedMentor) {
            throw new UnauthorizedException("view", "project documents");
        }
    }
}
