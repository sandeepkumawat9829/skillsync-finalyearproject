package com.fyp.service;

import com.fyp.model.dto.MentorAssignmentDTO;
import com.fyp.model.dto.MentorProfileDTO;
import com.fyp.model.dto.MentorRequestDTO;
import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.InvitationStatus;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorRequestRepository mentorRequestRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<MentorProfileDTO> getAvailableMentors() {
        return mentorProfileRepository.findAll().stream()
                .filter(m -> m.getCurrentProjectCount() < m.getMaxProjectsAllowed())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MentorProfileDTO> getAllMentors() {
        return mentorProfileRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MentorProfileDTO getMentor(Long mentorId) {
        // Try by profile ID first (frontend sends mentorId = profile PK)
        // then fallback to user ID for backward compatibility
        MentorProfile profile = mentorProfileRepository.findById(mentorId)
                .or(() -> mentorProfileRepository.findByUserId(mentorId))
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        return toDTO(profile);
    }

    @Transactional
    public void sendMentorRequest(Long teamId, Long mentorUserId, Long requesterUserId, String message) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        User mentor = userRepository.findById(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Check if requester is team leader
        if (!team.getTeamLeader().getId().equals(requesterUserId)) {
            throw new RuntimeException("Only team leader can request a mentor");
        }

        // Check if team already has mentor
        if (mentorAssignmentRepository.findByTeamId(teamId).isPresent()) {
            throw new RuntimeException("Team already has a mentor");
        }

        // Check if team is complete
        if (team.getStatus() != TeamStatus.COMPLETE) {
            throw new RuntimeException("Team must be complete before requesting a mentor");
        }

        // Check if mentor is available
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        if (mentorProfile.getCurrentProjectCount() >= mentorProfile.getMaxProjectsAllowed()) {
            throw new RuntimeException("Mentor has reached maximum project capacity");
        }

        // Check existing pending request
        List<MentorRequest> existing = mentorRequestRepository.findByTeamId(teamId).stream()
                .filter(r -> r.getStatus() == InvitationStatus.PENDING)
                .toList();
        if (!existing.isEmpty()) {
            throw new RuntimeException("You already have a pending mentor request");
        }

        MentorRequest request = MentorRequest.builder()
                .team(team)
                .mentor(mentor)
                .project(team.getProject())
                .message(message)
                .status(InvitationStatus.PENDING)
                .build();
        mentorRequestRepository.save(request);

        // Update team status
        team.setStatus(TeamStatus.MENTOR_REQUESTED);
        teamRepository.save(team);

        // Update project status
        Project project = team.getProject();
        project.setStatus(ProjectStatus.PENDING_MENTOR);
        projectRepository.save(project);

        // Notify mentor
        notificationService.sendNotification(
                mentorUserId,
                "MENTOR_REQUEST",
                "New Mentor Request",
                "Team '" + team.getTeamName() + "' has requested you as their mentor.",
                "/mentor/requests");

        emailService.sendMentorRequestEmail(
                mentor.getEmail(),
                mentorProfile.getFullName(),
                team.getTeamName(),
                team.getProject().getTitle(),
                request.getId().toString()
        );
    }

    @Transactional
    public void acceptMentorRequest(Long requestId, Long mentorUserId) {
        MentorRequest request = mentorRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getMentor().getId().equals(mentorUserId)) {
            throw new RuntimeException("You cannot accept this request");
        }

        if (request.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Request is no longer pending");
        }

        // Accept request
        request.setStatus(InvitationStatus.ACCEPTED);
        request.setRespondedAt(LocalDateTime.now());
        mentorRequestRepository.save(request);

        // Create mentor assignment
        MentorAssignment assignment = MentorAssignment.builder()
                .team(request.getTeam())
                .mentor(request.getMentor())
                .project(request.getProject())
                .status("ACTIVE")
                .build();
        mentorAssignmentRepository.save(assignment);

        // Update mentor project count
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(mentorUserId).get();
        mentorProfile.setCurrentProjectCount(mentorProfile.getCurrentProjectCount() + 1);
        mentorProfileRepository.save(mentorProfile);

        // Update team status
        Team team = request.getTeam();
        team.setStatus(TeamStatus.ACTIVE);
        teamRepository.save(team);

        // Update project status
        Project project = request.getProject();
        project.setStatus(ProjectStatus.MENTOR_ASSIGNED);
        projectRepository.save(project);

        // Notify team leader
        String mentorName = mentorProfile.getFullName();
        notificationService.sendNotification(
                team.getTeamLeader().getId(),
                "MENTOR_ACCEPTED",
                "Mentor Assigned",
                mentorName + " has accepted to be your mentor!",
                "/team");
    }

    @Transactional
    public void rejectMentorRequest(Long requestId, Long mentorUserId) {
        MentorRequest request = mentorRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!request.getMentor().getId().equals(mentorUserId)) {
            throw new RuntimeException("You cannot reject this request");
        }

        request.setStatus(InvitationStatus.REJECTED);
        request.setRespondedAt(LocalDateTime.now());
        mentorRequestRepository.save(request);

        // Revert team status
        Team team = request.getTeam();
        team.setStatus(TeamStatus.COMPLETE);
        teamRepository.save(team);

        // Revert project status
        Project project = request.getProject();
        project.setStatus(ProjectStatus.TEAM_COMPLETE);
        projectRepository.save(project);

        // Notify team leader
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(mentorUserId).get();
        notificationService.sendNotification(
                team.getTeamLeader().getId(),
                "MENTOR_REJECTED",
                "Mentor Request Rejected",
                mentorProfile.getFullName() + " has declined your mentor request. You can request another mentor.",
                "/mentors");
    }

    public List<MentorRequestDTO> getMyPendingRequests(Long mentorUserId) {
        return mentorRequestRepository.findByMentorIdAndStatus(mentorUserId, InvitationStatus.PENDING)
                .stream().map(this::toRequestDTO).collect(Collectors.toList());
    }

    public List<MentorRequestDTO> getAllMyRequests(Long mentorUserId) {
        return mentorRequestRepository.findByMentorId(mentorUserId)
                .stream().map(this::toRequestDTO).collect(Collectors.toList());
    }

    private MentorRequestDTO toRequestDTO(MentorRequest request) {
        Team team = request.getTeam();
        Project project = request.getProject();

        List<MentorRequestDTO.TeamMemberInfo> members = List.of();
        if (team != null && team.getMembers() != null) {
            members = team.getMembers().stream()
                    .map(m -> MentorRequestDTO.TeamMemberInfo.builder()
                            .userId(m.getUser().getId())
                            .name(studentProfileRepository.findByUserId(m.getUser().getId())
                                    .map(StudentProfile::getFullName)
                                    .orElse(m.getUser().getEmail()))
                            .role(m.getRole().name())
                            .build())
                    .collect(Collectors.toList());
        }

        String teamLeaderName = null;
        if (team != null && team.getTeamLeader() != null) {
            teamLeaderName = studentProfileRepository.findByUserId(team.getTeamLeader().getId())
                    .map(StudentProfile::getFullName)
                    .orElse(team.getTeamLeader().getEmail());
        }

        return MentorRequestDTO.builder()
                .requestId(request.getId())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getTeamName() : null)
                .projectId(project != null ? project.getId() : null)
                .projectTitle(project != null ? project.getTitle() : null)
                .projectAbstract(project != null ? project.getAbstractText() : null)
                .projectDomain(project != null ? project.getDomain() : null)
                .teamLeaderId(team != null && team.getTeamLeader() != null ? team.getTeamLeader().getId() : null)
                .teamLeaderName(teamLeaderName)
                .teamMembers(members)
                .message(request.getMessage())
                .status(request.getStatus().name())
                .requestedAt(request.getRequestedAt())
                .respondedAt(request.getRespondedAt())
                .build();
    }

    public List<MentorAssignmentDTO> getMyAssignments(Long mentorUserId) {
        return mentorAssignmentRepository.findByMentorId(mentorUserId)
                .stream().map(this::toAssignmentDTO).collect(Collectors.toList());
    }

    private MentorAssignmentDTO toAssignmentDTO(MentorAssignment assignment) {
        Team team = assignment.getTeam();
        Project project = assignment.getProject();
        return MentorAssignmentDTO.builder()
                .assignmentId(assignment.getId())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getTeamName() : null)
                .projectId(project != null ? project.getId() : null)
                .projectTitle(project != null ? project.getTitle() : null)
                .projectStatus(project != null ? project.getStatus().name() : null)
                .memberCount(team != null ? team.getCurrentMemberCount() : 0)
                .progress(0)
                .assignedAt(assignment.getAssignedAt())
                .status(assignment.getStatus())
                .build();
    }

    private MentorProfileDTO toDTO(MentorProfile profile) {
        Integer maxProjects = profile.getMaxProjectsAllowed() != null ? profile.getMaxProjectsAllowed() : 5;
        Integer currentProjects = profile.getCurrentProjectCount() != null ? profile.getCurrentProjectCount() : 0;
        return MentorProfileDTO.builder()
                .mentorId(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .fullName(profile.getFullName())
                .employeeId(profile.getEmployeeId())
                .department(profile.getDepartment())
                .designation(profile.getDesignation())
                .expertise(profile.getSpecializations())
                .maxStudents(maxProjects)
                .currentStudents(currentProjects)
                .phone(profile.getPhone())
                .officeLocation(profile.getOfficeLocation())
                .bio(profile.getBio())
                .profileImageUrl(profile.getProfileImageUrl())
                .experience(0)
                .isAvailable(currentProjects < maxProjects)
                .build();
    }

    /**
     * Admin/HOD force-assigns a mentor to a team that hasn't been able to get one.
     * This bypasses the normal request-accept flow.
     */
    @Transactional
    public MentorAssignment forceAssignMentor(Long teamId, Long mentorUserId, Long adminUserId) {
        // Verify admin is making the request
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (admin.getRole() != com.fyp.model.enums.Role.ADMIN) {
            throw new RuntimeException("Only admins can force-assign mentors");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        User mentor = userRepository.findById(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Check if team already has a mentor
        if (mentorAssignmentRepository.findByTeamId(teamId).isPresent()) {
            throw new RuntimeException("Team already has a mentor assigned");
        }

        // Get mentor profile
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(mentorUserId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        // Create mentor assignment directly
        MentorAssignment assignment = MentorAssignment.builder()
                .team(team)
                .mentor(mentor)
                .project(team.getProject())
                .status("ACTIVE")
                .build();
        MentorAssignment saved = mentorAssignmentRepository.save(assignment);

        // Update mentor project count
        mentorProfile.setCurrentProjectCount(mentorProfile.getCurrentProjectCount() + 1);
        mentorProfileRepository.save(mentorProfile);

        // Update team status
        team.setStatus(TeamStatus.ACTIVE);
        teamRepository.save(team);

        // Update project status
        Project project = team.getProject();
        project.setStatus(ProjectStatus.MENTOR_ASSIGNED);
        projectRepository.save(project);

        // Cancel any pending mentor requests for this team
        List<MentorRequest> pendingRequests = mentorRequestRepository.findByTeamId(teamId).stream()
                .filter(r -> r.getStatus() == InvitationStatus.PENDING)
                .toList();
        for (MentorRequest request : pendingRequests) {
            request.setStatus(InvitationStatus.CANCELLED);
            request.setRespondedAt(LocalDateTime.now());
            mentorRequestRepository.save(request);
        }

        // Notify team leader
        notificationService.sendNotification(
                team.getTeamLeader().getId(),
                "MENTOR_FORCE_ASSIGNED",
                "Mentor Assigned by Admin",
                mentorProfile.getFullName() + " has been assigned as your mentor by the administrator.",
                "/team");

        // Notify mentor
        notificationService.sendNotification(
                mentorUserId,
                "MENTOR_FORCE_ASSIGNED",
                "You've Been Assigned as Mentor",
                "You have been assigned to mentor team '" + team.getTeamName() + "' by the administrator.",
                "/mentor/assignments");

        return saved;
    }

    /**
     * Get all teams that don't have a mentor assigned yet.
     * Used by admin to see which teams need mentor assignment.
     */
    public List<Team> getTeamsWithoutMentor() {
        List<Team> allTeams = teamRepository.findAll();
        return allTeams.stream()
                .filter(team -> {
                    // Team must be complete but without mentor
                    boolean isComplete = team.getStatus() == TeamStatus.COMPLETE
                            || team.getStatus() == TeamStatus.MENTOR_REQUESTED;
                    boolean hasMentor = mentorAssignmentRepository.findByTeamId(team.getId()).isPresent();
                    return isComplete && !hasMentor;
                })
                .collect(Collectors.toList());
    }
}
