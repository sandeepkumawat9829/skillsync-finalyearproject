package com.fyp.service;

import com.fyp.exception.BusinessRuleViolationException;
import com.fyp.exception.ResourceNotFoundException;
import com.fyp.exception.UnauthorizedException;
import com.fyp.model.dto.TeamDTO;
import com.fyp.model.dto.TeamMemberDTO;
import com.fyp.model.dto.JoinRequestDTO;
import com.fyp.model.dto.TeamInvitationDTO;
import com.fyp.model.entity.*;
import com.fyp.model.enums.InvitationStatus;
import com.fyp.model.enums.MemberRole;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamInvitationRepository teamInvitationRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProjectRepository projectRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final NotificationService notificationService;
    private final ChatService chatService;
    private final EmailService emailService;

    // isUserInWorkingTeam check removed — students can join multiple teams freely

    @Transactional(readOnly = true)
    public TeamDTO getTeam(Long teamId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));
        return toDTO(team);
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeam(Long teamId, Long userId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));
        validateTeamAccess(team, userId);
        return toDTO(team);
    }

    @Transactional
    public TeamDTO createTeam(String teamName, Long projectId, Integer maxMembers, Long userId) {
        // Find the project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        // Find the user (team leader)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if project already has a team
        if (teamRepository.findByProjectId(projectId).isPresent()) {
            throw new BusinessRuleViolationException("Project already has a team", "PROJECT_HAS_TEAM");
        }

        // Students can join multiple teams — no restriction here

        // Create the team
        Team team = Team.builder()
                .teamName(teamName)
                .project(project)
                .teamLeader(user)
                .maxMembers(maxMembers != null ? maxMembers : 4)
                .currentMemberCount(1)
                .isComplete(false)
                .status(TeamStatus.FORMING)
                .build();
        team = teamRepository.save(team);

        // Add the creator as team leader/member
        TeamMember leaderMember = TeamMember.builder()
                .team(team)
                .user(user)
                .role(MemberRole.LEADER)
                .build();
        teamMemberRepository.save(leaderMember);

        // Link project to team
        project.setTeam(team);
        projectRepository.save(project);

        // Auto-create a team chat room
        chatService.getOrCreateTeamRoom(team.getId(), userId);

        return toDTO(team);
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeamByProject(Long projectId) {
        Team team = teamRepository.findByProjectIdWithDetails(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "projectId", projectId));
        return toDTO(team);
    }

    @Transactional(readOnly = true)
    public TeamDTO getTeamByProject(Long projectId, Long userId) {
        Team team = teamRepository.findByProjectIdWithDetails(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "projectId", projectId));
        validateTeamAccess(team, userId);
        return toDTO(team);
    }

    @Transactional(readOnly = true)
    public TeamDTO getMyTeam(Long userId) {
        // Find team where user is a member
        List<TeamMember> memberships = teamMemberRepository.findByUserId(userId);
        if (memberships.isEmpty()) {
            return null;
        }
        return toDTO(memberships.get(0).getTeam());
    }

    @Transactional(readOnly = true)
    public List<TeamDTO> getMyTeams(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == com.fyp.model.enums.Role.MENTOR) {
            return mentorAssignmentRepository.findByMentorId(userId).stream()
                    .map(assignment -> toDTO(assignment.getTeam()))
                    .collect(Collectors.toList());
        } else {
            // Student: typically in only one team
            return teamMemberRepository.findByUserId(userId).stream()
                    .map(member -> toDTO(member.getTeam()))
                    .collect(Collectors.toList());
        }
    }

    @Transactional
    public void inviteMember(Long teamId, Long inviteeUserId, Long inviterUserId, String message) {
        // Use pessimistic lock to prevent race conditions
        Team team = teamRepository.findByIdWithLock(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        User inviter = userRepository.findById(inviterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", inviterUserId));

        User invitee = userRepository.findById(inviteeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", inviteeUserId));

        // Check if invitee is a student (only students can be invited to teams)
        if (invitee.getRole() != com.fyp.model.enums.Role.STUDENT) {
            throw new BusinessRuleViolationException(
                    "Only students can be invited to teams. Use the mentor request feature to add a mentor.",
                    "NOT_A_STUDENT");
        }

        // Check if inviter is team leader
        if (!team.getTeamLeader().getId().equals(inviterUserId)) {
            throw new UnauthorizedException("invite members to", "team");
        }

        // Check if team is full
        if (team.getCurrentMemberCount() >= team.getMaxMembers()) {
            throw new BusinessRuleViolationException("Team is already full", "TEAM_FULL");
        }

        // Students can join multiple teams — no restriction here

        // Check if invitee is already a member of this team
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, inviteeUserId)) {
            throw new BusinessRuleViolationException(
                    "This user is already a member of your team", "ALREADY_MEMBER");
        }

        // Check if invitation already exists
        List<TeamInvitation> existing = teamInvitationRepository.findByTeamId(teamId).stream()
                .filter(inv -> inv.getToUser().getId().equals(inviteeUserId)
                        && inv.getStatus() == InvitationStatus.PENDING)
                .toList();
        if (!existing.isEmpty()) {
            throw new BusinessRuleViolationException("Invitation already sent to this user", "DUPLICATE_INVITATION");
        }

        TeamInvitation invitation = TeamInvitation.builder()
                .team(team)
                .fromUser(inviter)
                .toUser(invitee)
                .message(message)
                .status(InvitationStatus.PENDING)
                .build();
        teamInvitationRepository.save(invitation);

        // Send notification
        notificationService.sendNotification(
                inviteeUserId,
                "TEAM_INVITATION",
                "Team Invitation",
                "You have been invited to join team: " + team.getTeamName(),
                "/student/invitations");

        String inviteeName = studentProfileRepository.findByUserId(inviteeUserId)
                .map(StudentProfile::getFullName).orElse(invitee.getEmail());
        String inviterName = studentProfileRepository.findByUserId(inviterUserId)
                .map(StudentProfile::getFullName).orElse(inviter.getEmail());
                
        emailService.sendTeamInvitationEmail(
                invitee.getEmail(),
                inviteeName,
                team.getTeamName(),
                inviterName,
                invitation.getId().toString()
        );
    }

    @Transactional
    public TeamDTO acceptInvitation(Long invitationId, Long userId) {
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));

        if (!invitation.getToUser().getId().equals(userId)) {
            throw new UnauthorizedException("accept", "invitation");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessRuleViolationException("Invitation is no longer pending", "INVITATION_EXPIRED");
        }

        // Students can join multiple teams — no restriction here

        // Use pessimistic lock to prevent race condition when accepting invitation
        Team team = teamRepository.findByIdWithLock(invitation.getTeam().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", invitation.getTeam().getId()));

        // Check if team is full (with lock to prevent race condition)
        if (team.getCurrentMemberCount() >= team.getMaxMembers()) {
            throw new BusinessRuleViolationException(
                    "Team is already full. Another member joined before you.",
                    "TEAM_FULL");
        }

        // Check if user is already a member of this team
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), invitation.getToUser().getId())) {
            throw new BusinessRuleViolationException("You are already a member of this team", "ALREADY_MEMBER");
        }

        // Accept invitation
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setRespondedAt(LocalDateTime.now());
        teamInvitationRepository.save(invitation);

        // Add user to team
        TeamMember member = TeamMember.builder()
                .team(team)
                .user(invitation.getToUser())
                .role(MemberRole.MEMBER)
                .build();
        teamMemberRepository.save(member);

        // Update team member count atomically (lock ensures thread safety)
        team.setCurrentMemberCount(team.getCurrentMemberCount() + 1);
        if (team.getCurrentMemberCount() >= team.getMaxMembers()) {
            team.setIsComplete(true);
            team.setStatus(TeamStatus.COMPLETE);
            // Update project status
            Project project = team.getProject();
            project.setStatus(ProjectStatus.TEAM_COMPLETE);
            projectRepository.save(project);
        }
        teamRepository.save(team);

        // Notify team leader
        notificationService.sendNotification(
                team.getTeamLeader().getId(),
                "MEMBER_JOINED",
                "New Team Member",
                invitation.getToUser().getEmail() + " has joined your team!",
                "/team");

        return toDTO(team);
    }

    @Transactional
    public void rejectInvitation(Long invitationId, Long userId) {
        TeamInvitation invitation = teamInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation", "id", invitationId));

        if (!invitation.getToUser().getId().equals(userId)) {
            throw new UnauthorizedException("reject", "invitation");
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        invitation.setRespondedAt(LocalDateTime.now());
        teamInvitationRepository.save(invitation);

        // Notify team leader
        notificationService.sendNotification(
                invitation.getFromUser().getId(),
                "INVITATION_REJECTED",
                "Invitation Rejected",
                invitation.getToUser().getEmail() + " has rejected your team invitation.",
                "/team");
    }

    public List<TeamInvitationDTO> getMyPendingInvitations(Long userId) {
        return teamInvitationRepository.findByToUserIdAndStatus(userId, InvitationStatus.PENDING)
                .stream()
                .map(this::toInvitationDTO)
                .collect(Collectors.toList());
    }

    private TeamInvitationDTO toInvitationDTO(TeamInvitation invitation) {
        String fromUserName = studentProfileRepository.findByUserId(invitation.getFromUser().getId())
                .map(StudentProfile::getFullName)
                .orElse(invitation.getFromUser().getEmail());

        return TeamInvitationDTO.builder()
                .invitationId(invitation.getId())
                .teamId(invitation.getTeam().getId())
                .teamName(invitation.getTeam().getTeamName())
                .projectTitle(invitation.getTeam().getProject() != null
                        ? invitation.getTeam().getProject().getTitle() : null)
                .fromUserId(invitation.getFromUser().getId())
                .fromUserName(fromUserName)
                .toUserId(invitation.getToUser().getId())
                .message(invitation.getMessage())
                .status(invitation.getStatus().name())
                .createdAt(invitation.getCreatedAt() != null ? invitation.getCreatedAt().toString() : null)
                .respondedAt(invitation.getRespondedAt() != null ? invitation.getRespondedAt().toString() : null)
                .build();
    }

    @Transactional
    public void removeMember(Long teamId, Long memberId, Long requesterId) {
        Team team = teamRepository.findByIdWithLock(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        // Only the team leader can remove members
        if (!team.getTeamLeader().getId().equals(requesterId)) {
            throw new UnauthorizedException("remove members from", "team");
        }

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", memberId));

        // Verify this member belongs to this team
        if (!member.getTeam().getId().equals(teamId)) {
            throw new BusinessRuleViolationException("Member does not belong to this team", "MEMBER_NOT_IN_TEAM");
        }

        // Cannot remove the team leader
        if (member.getRole() == MemberRole.LEADER) {
            throw new BusinessRuleViolationException("Cannot remove the team leader", "CANNOT_REMOVE_LEADER");
        }

        // Remove the member
        teamMemberRepository.delete(member);

        // Update team member count
        team.setCurrentMemberCount(team.getCurrentMemberCount() - 1);
        if (team.getCurrentMemberCount() < team.getMaxMembers()) {
            team.setIsComplete(false);
            team.setStatus(TeamStatus.FORMING);
        }
        teamRepository.save(team);

        // Notify the removed member
        notificationService.sendNotification(
                member.getUser().getId(),
                "MEMBER_REMOVED",
                "Removed from Team",
                "You have been removed from team: " + team.getTeamName(),
                "/student/projects");
    }

    @Transactional(readOnly = true)
    public List<TeamDTO> getIncompleteTeams() {
        // Use optimized query with JOIN FETCH
        return teamRepository.findIncompleteTeamsWithDetails().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void requestToJoin(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if team is full
        if (team.getIsComplete() || team.getCurrentMemberCount() >= team.getMaxMembers()) {
            throw new BusinessRuleViolationException("Team is already full", "TEAM_FULL");
        }

        // Students can join multiple teams — no restriction here

        // Check if user is already a member of this team
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new BusinessRuleViolationException(
                    "You are already a member of this team", "ALREADY_MEMBER");
        }

        // Check if a request/invitation already exists
        List<TeamInvitation> existing = teamInvitationRepository.findByTeamId(teamId).stream()
                .filter(inv -> (inv.getToUser().getId().equals(userId) || inv.getFromUser().getId().equals(userId))
                        && inv.getStatus() == InvitationStatus.PENDING)
                .toList();
        if (!existing.isEmpty()) {
            throw new BusinessRuleViolationException("A pending request already exists", "DUPLICATE_REQUEST");
        }

        // Create a join request (invitation from user to team leader)
        // We store it as an invitation where fromUser is the requester and toUser is the team leader
        TeamInvitation joinRequest = TeamInvitation.builder()
                .team(team)
                .fromUser(user)  // The user requesting to join
                .toUser(team.getTeamLeader())  // The team leader who will approve/reject
                .message("Request to join your team")
                .status(InvitationStatus.PENDING)
                .build();
        teamInvitationRepository.save(joinRequest);

        // Notify team leader
        String requesterName = studentProfileRepository.findByUserId(userId)
                .map(StudentProfile::getFullName)
                .orElse(user.getEmail());
        
        notificationService.sendNotification(
                team.getTeamLeader().getId(),
                "JOIN_REQUEST",
                "Team Join Request",
                requesterName + " has requested to join your team: " + team.getTeamName(),
                "/student/teams/" + teamId);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestDTO> getJoinRequests(Long teamId, Long userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        // Only team leader can view join requests
        if (!team.getTeamLeader().getId().equals(userId)) {
            throw new UnauthorizedException("view join requests for", "team");
        }

        // Get pending invitations where toUser is the team leader (these are join requests)
        return teamInvitationRepository.findByTeamId(teamId).stream()
                .filter(inv -> inv.getToUser().getId().equals(userId) 
                        && inv.getStatus() == InvitationStatus.PENDING)
                .map(inv -> JoinRequestDTO.builder()
                        .requestId(inv.getId())
                        .teamId(team.getId())
                        .teamName(team.getTeamName())
                        .fromUserId(inv.getFromUser().getId())
                        .fromUserName(studentProfileRepository.findByUserId(inv.getFromUser().getId())
                                .map(StudentProfile::getFullName)
                                .orElse(inv.getFromUser().getEmail()))
                        .fromUserEmail(inv.getFromUser().getEmail())
                        .message(inv.getMessage())
                        .status(inv.getStatus().name())
                        .createdAt(inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Outgoing join requests created by current user (stored as TeamInvitation where fromUser is requester).
     */
    @Transactional(readOnly = true)
    public List<JoinRequestDTO> getMyOutgoingJoinRequests(Long userId) {
        return teamInvitationRepository.findByFromUserId(userId).stream()
                .filter(inv -> inv.getStatus() == InvitationStatus.PENDING)
                .map(inv -> JoinRequestDTO.builder()
                        .requestId(inv.getId())
                        .teamId(inv.getTeam().getId())
                        .teamName(inv.getTeam().getTeamName())
                        .fromUserId(inv.getFromUser().getId())
                        .fromUserName(studentProfileRepository.findByUserId(inv.getFromUser().getId())
                                .map(StudentProfile::getFullName)
                                .orElse(inv.getFromUser().getEmail()))
                        .fromUserEmail(inv.getFromUser().getEmail())
                        .message(inv.getMessage())
                        .status(inv.getStatus().name())
                        .createdAt(inv.getCreatedAt() != null ? inv.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptJoinRequest(Long requestId, Long userId) {
        TeamInvitation joinRequest = teamInvitationRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("JoinRequest", "id", requestId));

        // Verify the user is the team leader (toUser in join request)
        if (!joinRequest.getToUser().getId().equals(userId)) {
            throw new UnauthorizedException("accept", "join request");
        }

        if (joinRequest.getStatus() != InvitationStatus.PENDING) {
            throw new BusinessRuleViolationException("Request is no longer pending", "REQUEST_EXPIRED");
        }

        // Use pessimistic lock to prevent race condition
        Team team = teamRepository.findByIdWithLock(joinRequest.getTeam().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", joinRequest.getTeam().getId()));

        // Check if team is full
        if (team.getCurrentMemberCount() >= team.getMaxMembers()) {
            throw new BusinessRuleViolationException("Team is already full", "TEAM_FULL");
        }

        // Students can join multiple teams — no restriction here
        User requester = joinRequest.getFromUser();

        // Check if requester is already a member of this team
        if (teamMemberRepository.existsByTeamIdAndUserId(team.getId(), requester.getId())) {
            throw new BusinessRuleViolationException("Requester is already a member of this team", "ALREADY_MEMBER");
        }

        // Accept the request
        joinRequest.setStatus(InvitationStatus.ACCEPTED);
        joinRequest.setRespondedAt(LocalDateTime.now());
        teamInvitationRepository.save(joinRequest);

        // Add user to team
        TeamMember member = TeamMember.builder()
                .team(team)
                .user(requester)
                .role(MemberRole.MEMBER)
                .build();
        teamMemberRepository.save(member);

        // Update team member count
        team.setCurrentMemberCount(team.getCurrentMemberCount() + 1);
        if (team.getCurrentMemberCount() >= team.getMaxMembers()) {
            team.setIsComplete(true);
            team.setStatus(TeamStatus.COMPLETE);
            Project project = team.getProject();
            project.setStatus(ProjectStatus.TEAM_COMPLETE);
            projectRepository.save(project);
        }
        teamRepository.save(team);

        // Notify the requester
        notificationService.sendNotification(
                requester.getId(),
                "JOIN_REQUEST_ACCEPTED",
                "Join Request Accepted",
                "Your request to join team '" + team.getTeamName() + "' has been accepted!",
                "/student/teams/" + team.getId());
    }

    @Transactional
    public void rejectJoinRequest(Long requestId, Long userId) {
        TeamInvitation joinRequest = teamInvitationRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("JoinRequest", "id", requestId));

        // Verify the user is the team leader
        if (!joinRequest.getToUser().getId().equals(userId)) {
            throw new UnauthorizedException("reject", "join request");
        }

        joinRequest.setStatus(InvitationStatus.REJECTED);
        joinRequest.setRespondedAt(LocalDateTime.now());
        teamInvitationRepository.save(joinRequest);

        // Notify the requester
        notificationService.sendNotification(
                joinRequest.getFromUser().getId(),
                "JOIN_REQUEST_REJECTED",
                "Join Request Rejected",
                "Your request to join team '" + joinRequest.getTeam().getTeamName() + "' was not accepted.",
                "/student/projects");
    }

    private TeamDTO toDTO(Team team) {
        List<TeamMemberDTO> members = teamMemberRepository.findByTeamId(team.getId()).stream()
                .map(this::toMemberDTO)
                .collect(Collectors.toList());

        String mentorName = null;
        Long mentorId = null;
        MentorAssignment assignment = mentorAssignmentRepository.findByTeamId(team.getId()).orElse(null);
        if (assignment != null) {
            mentorId = assignment.getMentor().getId();
            mentorName = mentorProfileRepository.findByUserId(mentorId)
                    .map(MentorProfile::getFullName)
                    .orElse(assignment.getMentor().getEmail());
        }

        return TeamDTO.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .projectId(team.getProject().getId())
                .projectTitle(team.getProject().getTitle())
                .teamLeaderId(team.getTeamLeader().getId())
                .teamLeaderName(studentProfileRepository.findByUserId(team.getTeamLeader().getId())
                        .map(StudentProfile::getFullName)
                        .orElse(team.getTeamLeader().getEmail()))
                .currentMemberCount(team.getCurrentMemberCount())
                .maxMembers(team.getMaxMembers())
                .isComplete(team.getIsComplete())
                .status(team.getStatus().name())
                .members(members)
                .mentorName(mentorName)
                .mentorId(mentorId)
                .createdAt(team.getCreatedAt() != null ? team.getCreatedAt().toString() : null)
                .build();
    }

    private TeamMemberDTO toMemberDTO(TeamMember member) {
        StudentProfile profile = studentProfileRepository.findByUserId(member.getUser().getId()).orElse(null);

        return TeamMemberDTO.builder()
                .memberId(member.getId())
                .userId(member.getUser().getId())
                .fullName(profile != null ? profile.getFullName() : member.getUser().getEmail())
                .email(member.getUser().getEmail())
                .role(member.getRole().name())
                .enrollmentNumber(profile != null ? profile.getEnrollmentNumber() : null)
                .branch(profile != null ? profile.getBranch() : null)
                .contributionScore(member.getContributionScore())
                .joinedAt(member.getJoinedAt() != null ? member.getJoinedAt().toString() : null)
                .profileImageUrl(profile != null ? profile.getProfileImageUrl() : null)
                .build();
    }

    private void validateTeamAccess(Team team, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getRole() == Role.ADMIN) {
            return;
        }

        boolean isLeader = team.getTeamLeader() != null && team.getTeamLeader().getId().equals(userId);
        boolean isMember = teamMemberRepository.existsByTeamIdAndUserId(team.getId(), userId);
        boolean isAssignedMentor = mentorAssignmentRepository.findByTeamId(team.getId())
                .map(assignment -> assignment.getMentor() != null && assignment.getMentor().getId().equals(userId))
                .orElse(false);

        if (!isLeader && !isMember && !isAssignedMentor) {
            throw new UnauthorizedException("view", "team");
        }
    }

    // ==================== ADMIN METHODS ====================

    @Transactional(readOnly = true)
    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTeam(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));
        
        // Remove relationships
        if (team.getProject() != null) {
            Project p = team.getProject();
            p.setTeam(null);
            p.setStatus(ProjectStatus.TEAM_FORMING);
            projectRepository.save(p);
        }

        // Delete members, invitations, and assignments first due to FK constraints
        teamMemberRepository.deleteAll(teamMemberRepository.findByTeamId(teamId));
        teamInvitationRepository.deleteAll(teamInvitationRepository.findByTeamId(teamId));
        mentorAssignmentRepository.findByTeamId(teamId).ifPresent(mentorAssignmentRepository::delete);
        
        teamRepository.delete(team);
    }

    @Transactional
    public TeamDTO updateTeamStatus(Long teamId, String statusStr) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));
        
        try {
            TeamStatus status = TeamStatus.valueOf(statusStr.toUpperCase());
            team.setStatus(status);
            if (status == TeamStatus.COMPLETE) {
                team.setIsComplete(true);
            } else if (status == TeamStatus.FORMING) {
                team.setIsComplete(false);
            }
            teamRepository.save(team);
            return toDTO(team);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleViolationException("Invalid team status", "INVALID_STATUS");
        }
    }
}
