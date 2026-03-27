package com.fyp.service;

import com.fyp.model.dto.StudentProfileDTO;
import com.fyp.model.entity.*;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;

    public StudentProfileDTO getStudentProfile(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        return toStudentDTO(profile);
    }

    public List<StudentProfileDTO> searchStudents(String query) {
        return studentProfileRepository.findAll().stream()
                .filter(p -> matchesQuery(p, query))
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    public List<StudentProfileDTO> getStudentsByBranch(String branch) {
        return studentProfileRepository.findByBranch(branch).stream()
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    public List<StudentProfileDTO> getAvailableStudents() {
        // Students who are not in any team
        return studentProfileRepository.findAll().stream()
                .filter(p -> teamMemberRepository.findByUserId(p.getUser().getId()).isEmpty())
                .map(this::toStudentDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentProfileDTO updateStudentProfile(Long userId, StudentProfileDTO updates) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (updates.getFullName() != null)
            profile.setFullName(updates.getFullName());
        if (updates.getBranch() != null)
            profile.setBranch(updates.getBranch());
        if (updates.getCurrentSemester() != null)
            profile.setCurrentSemester(updates.getCurrentSemester());
        if (updates.getCgpa() != null)
            profile.setCgpa(updates.getCgpa());
        if (updates.getPhone() != null)
            profile.setPhone(updates.getPhone());
        if (updates.getBio() != null)
            profile.setBio(updates.getBio());
        if (updates.getSkills() != null)
            profile.setSkills(updates.getSkills());
        if (updates.getGithubUrl() != null)
            profile.setGithubUrl(updates.getGithubUrl());
        if (updates.getLinkedinUrl() != null)
            profile.setLinkedinUrl(updates.getLinkedinUrl());
        if (updates.getPortfolioUrl() != null)
            profile.setPortfolioUrl(updates.getPortfolioUrl());
        if (updates.getProfileImageUrl() != null)
            profile.setProfileImageUrl(updates.getProfileImageUrl());

        profile = studentProfileRepository.save(profile);
        return toStudentDTO(profile);
    }

    private boolean matchesQuery(StudentProfile p, String query) {
        if (query == null || query.isBlank())
            return true;
        String lowerQuery = query.toLowerCase();
        return (p.getFullName() != null && p.getFullName().toLowerCase().contains(lowerQuery)) ||
                (p.getEnrollmentNumber() != null && p.getEnrollmentNumber().toLowerCase().contains(lowerQuery)) ||
                (p.getBranch() != null && p.getBranch().toLowerCase().contains(lowerQuery)) ||
                (p.getSkills() != null && p.getSkills().stream().anyMatch(s -> s.toLowerCase().contains(lowerQuery)));
    }

    private StudentProfileDTO toStudentDTO(StudentProfile profile) {
        List<TeamMember> memberships = teamMemberRepository.findByUserId(profile.getUser().getId());
        boolean hasTeam = !memberships.isEmpty();
        String teamName = null;
        String projectTitle = null;

        if (hasTeam) {
            Team team = memberships.get(0).getTeam();
            teamName = team.getTeamName();
            projectTitle = team.getProject().getTitle();
        }

        return StudentProfileDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .fullName(profile.getFullName())
                .enrollmentNumber(profile.getEnrollmentNumber())
                .branch(profile.getBranch())
                .currentSemester(profile.getCurrentSemester())
                .cgpa(profile.getCgpa())
                .phone(profile.getPhone())
                .bio(profile.getBio())
                .skills(profile.getSkills())
                .githubUrl(profile.getGithubUrl())
                .linkedinUrl(profile.getLinkedinUrl())
                .portfolioUrl(profile.getPortfolioUrl())
                .profileImageUrl(profile.getProfileImageUrl())
                .hasTeam(hasTeam)
                .teamName(teamName)
                .projectTitle(projectTitle)
                .build();
    }
}
