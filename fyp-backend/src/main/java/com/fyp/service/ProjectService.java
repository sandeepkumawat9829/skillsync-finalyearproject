package com.fyp.service;

import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.exception.UnauthorizedException;
import com.fyp.model.dto.CreateProjectRequest;
import com.fyp.model.dto.ProjectDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.MemberRole;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.ProjectVisibility;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final ProjectBucketRepository projectBucketRepository;

    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user already has a working project (with a mentor)
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        for (TeamMember member : memberships) {
            Team team = member.getTeam();
            if (team != null && mentorAssignmentRepository.findByTeamId(team.getId()).isPresent()) {
                throw new BusinessRuleViolationException(
                        "You already have an active project with a mentor allocated. You cannot create another project.",
                        "PROJECT_LIMIT_EXCEEDED");
            }
        }

        // Sanitize input to prevent XSS attacks
        String sanitizedTitle = sanitizeInput(request.getTitle());
        String sanitizedAbstract = sanitizeInput(request.getAbstractText());
        String sanitizedDescription = sanitizeInput(request.getFullDescription());
        String sanitizedProblemStatement = sanitizeInput(request.getProblemStatement());
        String sanitizedObjectives = sanitizeInput(request.getObjectives());
        String sanitizedMethodology = sanitizeInput(request.getMethodology());
        String sanitizedExpectedOutcome = sanitizeInput(request.getExpectedOutcome());
        ProjectBucket selectedBucket = null;

        if (Boolean.TRUE.equals(request.getFromBucket()) || request.getBucketId() != null) {
            if (request.getBucketId() == null) {
                throw new BusinessRuleViolationException(
                        "Bucket ID is required when creating a project from a bucket",
                        "BUCKET_ID_REQUIRED");
            }

            selectedBucket = projectBucketRepository.findById(request.getBucketId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProjectBucket", "id", request.getBucketId()));

            if (!Boolean.TRUE.equals(selectedBucket.getIsAvailable()) || !selectedBucket.hasAvailableSlots()) {
                throw new BusinessRuleViolationException(
                        "This bucket is no longer available",
                        "BUCKET_UNAVAILABLE");
            }
        }

        // Use enum for visibility with type safety
        String visibility = request.getVisibility() != null
                ? request.getVisibility()
                : ProjectVisibility.PRIVATE.name();

        Project project = Project.builder()
                .title(sanitizedTitle)
                .abstractText(sanitizedAbstract)
                .fullDescription(sanitizedDescription)
                .problemStatement(sanitizedProblemStatement)
                .objectives(sanitizedObjectives)
                .methodology(sanitizedMethodology)
                .expectedOutcome(sanitizedExpectedOutcome)
                .technologies(request.getTechnologies())
                .domain(request.getDomain())
                .createdBy(user)
                .visibility(visibility)
                .isFromBucket(selectedBucket != null)
                .githubRepoUrl(request.getGithubRepoUrl())
                .status(ProjectStatus.TEAM_FORMING)
                .build();

        project = projectRepository.save(project);

        if (selectedBucket != null) {
            selectedBucket.setAllocatedTeams(selectedBucket.getAllocatedTeams() + 1);
            if (!selectedBucket.hasAvailableSlots()) {
                selectedBucket.setIsAvailable(false);
            }
            projectBucketRepository.save(selectedBucket);
        }

        return toDTO(project);
    }

    @Transactional(readOnly = true)
    public ProjectDTO getProject(Long projectId) {
        Project project = projectRepository.findByIdWithDetails(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        return toDTO(project);
    }

    @Transactional(readOnly = true)
    public ProjectDTO getProject(Long projectId, Long userId) {
        Project project = projectRepository.findByIdWithDetails(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        validateProjectAccess(project, userId);
        return toDTO(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getMyProjects(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Get projects created by the user
        List<Project> myProjects = new java.util.ArrayList<>(
                projectRepository.findByCreatedByIdWithDetails(userId));

        // Also include projects the user is part of via team membership
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        for (TeamMember tm : memberships) {
            Project teamProject = tm.getTeam().getProject();
            if (teamProject != null && myProjects.stream().noneMatch(p -> p.getId().equals(teamProject.getId()))) {
                myProjects.add(teamProject);
            }
        }

        if (user.getRole() == Role.MENTOR) {
            mentorAssignmentRepository.findByMentorId(userId).stream()
                    .map(MentorAssignment::getProject)
                    .filter(project -> project != null)
                    .filter(project -> myProjects.stream().noneMatch(existing -> existing.getId().equals(project.getId())))
                    .forEach(myProjects::add);
        }

        return myProjects.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getPublicProjects() {
        // Use optimized query with JOIN FETCH to solve N+1 problem
        return projectRepository.findByVisibilityWithDetails(ProjectVisibility.PUBLIC.name()).stream()
                .map(this::toDTOWithAbstractOnly)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getAllProjects() {
        // Use optimized query with JOIN FETCH to solve N+1 problem
        return projectRepository.findAllWithDetails().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectDTO> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO updateProject(Long projectId, CreateProjectRequest request, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedException("update", "project");
        }

        // Sanitize and update fields
        if (request.getTitle() != null)
            project.setTitle(sanitizeInput(request.getTitle()));
        if (request.getAbstractText() != null)
            project.setAbstractText(sanitizeInput(request.getAbstractText()));
        if (request.getFullDescription() != null)
            project.setFullDescription(sanitizeInput(request.getFullDescription()));
        if (request.getProblemStatement() != null)
            project.setProblemStatement(sanitizeInput(request.getProblemStatement()));
        if (request.getObjectives() != null)
            project.setObjectives(sanitizeInput(request.getObjectives()));
        if (request.getMethodology() != null)
            project.setMethodology(sanitizeInput(request.getMethodology()));
        if (request.getExpectedOutcome() != null)
            project.setExpectedOutcome(sanitizeInput(request.getExpectedOutcome()));
        if (request.getTechnologies() != null)
            project.setTechnologies(request.getTechnologies());
        if (request.getDomain() != null)
            project.setDomain(request.getDomain());
        if (request.getVisibility() != null)
            project.setVisibility(request.getVisibility());
        if (request.getGithubRepoUrl() != null)
            project.setGithubRepoUrl(request.getGithubRepoUrl());

        project = projectRepository.save(project);
        return toDTO(project);
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getCreatedBy().getId().equals(userId)) {
            throw new UnauthorizedException("delete", "project");
        }

        if (project.getStatus() != ProjectStatus.DRAFT && project.getStatus() != ProjectStatus.TEAM_FORMING) {
            throw new BusinessRuleViolationException(
                    "Cannot delete project after team is complete or mentor assigned",
                    "PROJECT_DELETE_RESTRICTED");
        }

        projectRepository.delete(project);
    }

    // ==================== ADMIN METHODS ====================

    @Transactional
    public void adminDeleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));
        
        Team team = project.getTeam();
        if (team == null) {
            team = teamRepository.findByProjectId(projectId).orElse(null);
        }
        
        if (team != null) {
            team.setProject(null);
            teamRepository.save(team);
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDTO adminUpdateProjectStatus(Long projectId, String statusStr) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        try {
            ProjectStatus status = ProjectStatus.valueOf(statusStr.toUpperCase());
            project.setStatus(status);
            projectRepository.save(project);
            return toDTO(project);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleViolationException("Invalid project status", "INVALID_STATUS");
        }
    }

    /**
     * Sanitize user input to prevent XSS attacks.
     * Uses Spring's HtmlUtils which is free and built-in.
     */
    private String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input);
    }

    private void validateProjectAccess(Project project, Long userId) {
        if (ProjectVisibility.PUBLIC.name().equals(project.getVisibility())) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (project.getCreatedBy() != null && project.getCreatedBy().getId().equals(userId)) {
            return;
        }

        Team team = project.getTeam();
        if (team == null) {
            team = teamRepository.findByProjectId(project.getId()).orElse(null);
        }

        if (team == null) {
            throw new UnauthorizedException("view", "project");
        }

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId);
        boolean isAssignedMentor = mentorAssignmentRepository.findByTeamId(team.getId())
                .map(assignment -> assignment.getMentor() != null && assignment.getMentor().getId().equals(userId))
                .orElse(false);

        if (!isLeader && !isMember && !isAssignedMentor) {
            throw new UnauthorizedException("view", "project");
        }
    }

    private ProjectDTO toDTO(Project project) {
        String createdByName = studentProfileRepository.findByUserId(project.getCreatedBy().getId())
                .map(StudentProfile::getFullName)
                .orElse(project.getCreatedBy().getEmail());

        // Use already fetched team if available (from JOIN FETCH)
        Team team = project.getTeam();
        if (team == null) {
            team = teamRepository.findByProjectId(project.getId()).orElse(null);
        }

        Long teamId = team != null ? team.getId() : null;
        String teamName = team != null ? team.getTeamName() : null;
        String teamStatus = team != null && team.getStatus() != null ? team.getStatus().name() : null;
        Integer teamMemberCount = team != null ? team.getCurrentMemberCount() : 0;

        String mentorName = null;
        if (team != null) {
            mentorName = mentorAssignmentRepository.findByTeamId(team.getId())
                    .flatMap(ma -> mentorProfileRepository.findByUserId(ma.getMentor().getId()))
                    .map(MentorProfile::getFullName)
                    .orElse(null);
        }

        return ProjectDTO.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .abstractText(project.getAbstractText())
                .fullDescription(project.getFullDescription())
                .problemStatement(project.getProblemStatement())
                .objectives(project.getObjectives())
                .methodology(project.getMethodology())
                .expectedOutcome(project.getExpectedOutcome())
                .technologies(project.getTechnologies())
                .domain(project.getDomain())
                .createdById(project.getCreatedBy().getId())
                .createdByName(createdByName)
                .isFromBucket(project.getIsFromBucket())
                .status(project.getStatus().name())
                .visibility(project.getVisibility())
                .githubRepoUrl(project.getGithubRepoUrl())
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null)
                .teamId(teamId)
                .teamName(teamName)
                .teamStatus(teamStatus)
                .teamMemberCount(teamMemberCount)
                .hasMentor(mentorName != null)
                .mentorName(mentorName)
                .build();
    }

    public List<com.fyp.model.dto.CollegeProjectBucketDTO> getProjectBuckets() {
        // Mock implementation for demo
        return List.of(
                com.fyp.model.dto.CollegeProjectBucketDTO.builder()
                        .bucketId(1L)
                        .title("Smart Campus System")
                        .description("IoT based system for campus automation")
                        .department("Computer Science")
                        .technologies(List.of("IoT", "Angular", "Spring Boot"))
                        .difficultyLevel("MEDIUM")
                        .maxTeams(5)
                        .allocatedTeams(1)
                        .isAvailable(true)
                        .postedBy(1L)
                        .postedAt(java.time.LocalDateTime.now())
                        .build(),
                com.fyp.model.dto.CollegeProjectBucketDTO.builder()
                        .bucketId(2L)
                        .title("AI Attendance")
                        .description("Face recognition attendance using Python")
                        .department("Information Technology")
                        .technologies(List.of("Python", "OpenCV", "React"))
                        .difficultyLevel("HARD")
                        .maxTeams(3)
                        .allocatedTeams(0)
                        .isAvailable(true)
                        .postedBy(1L)
                        .postedAt(java.time.LocalDateTime.now())
                        .build());
    }

    private ProjectDTO toDTOWithAbstractOnly(Project project) {
        String createdByName = null;
        if (project.getCreatedBy() != null) {
            createdByName = studentProfileRepository.findByUserId(project.getCreatedBy().getId())
                    .map(StudentProfile::getFullName)
                    .orElse(project.getCreatedBy().getEmail());
        }

        return ProjectDTO.builder()
                .projectId(project.getId())
                .title(project.getTitle())
                .abstractText(project.getAbstractText())
                .technologies(project.getTechnologies())
                .domain(project.getDomain())
                .status(project.getStatus().name())
                .visibility(project.getVisibility())
                .githubRepoUrl(project.getGithubRepoUrl())
                .createdById(project.getCreatedBy() != null ? project.getCreatedBy().getId() : null)
                .createdByName(createdByName)
                .createdAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null)
                .build();
    }
}
