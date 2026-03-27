package com.fyp.service;

import com.fyp.model.dto.SkillAnalyticsDTO;
import com.fyp.model.dto.SkillDTO;
import com.fyp.model.dto.StudentSkillDTO;
import com.fyp.model.entity.*;
import com.fyp.model.entity.Skill.SkillCategory;
import com.fyp.model.entity.StudentSkill.ProficiencyLevel;
import com.fyp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final MentorSpecializationRepository mentorSpecializationRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    // Skill CRUD
    public List<SkillDTO> getAllSkills() {
        return skillRepository.findAllByOrderBySkillNameAsc()
                .stream()
                .map(this::toSkillDTO)
                .collect(Collectors.toList());
    }

    public List<SkillDTO> getSkillsByCategory(String category) {
        SkillCategory cat = SkillCategory.valueOf(category.toUpperCase());
        return skillRepository.findByCategoryOrderBySkillNameAsc(cat)
                .stream()
                .map(this::toSkillDTO)
                .collect(Collectors.toList());
    }

    public List<String> getCategories() {
        return Arrays.stream(SkillCategory.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public SkillDTO getSkill(Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        return toSkillDTO(skill);
    }

    @Transactional
    public SkillDTO createSkill(SkillDTO dto) {
        if (skillRepository.findBySkillNameIgnoreCase(dto.getSkillName()).isPresent()) {
            throw new RuntimeException("Skill already exists");
        }

        Skill skill = Skill.builder()
                .skillName(dto.getSkillName())
                .category(SkillCategory.valueOf(dto.getCategory()))
                .build();

        skill = skillRepository.save(skill);
        return toSkillDTO(skill);
    }

    // Student Skills
    public List<StudentSkillDTO> getStudentSkills(Long studentId) {
        return studentSkillRepository.findByStudentId(studentId)
                .stream()
                .map(this::toStudentSkillDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentSkillDTO addStudentSkill(Long studentId, Long skillId, String proficiency) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        StudentSkill studentSkill = StudentSkill.builder()
                .student(student)
                .skill(skill)
                .proficiencyLevel(ProficiencyLevel.valueOf(proficiency))
                .build();

        studentSkill = studentSkillRepository.save(studentSkill);
        return toStudentSkillDTO(studentSkill);
    }

    @Transactional
    public void removeStudentSkill(Long studentId, Long skillId) {
        studentSkillRepository.deleteByStudentIdAndSkillSkillId(studentId, skillId);
    }

    // Mentor Specializations
    public List<SkillDTO> getMentorSpecializations(Long mentorId) {
        return mentorSpecializationRepository.findByMentorId(mentorId)
                .stream()
                .map(ms -> toSkillDTO(ms.getSkill()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addMentorSpecialization(Long mentorId, Long skillId) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        MentorSpecialization spec = MentorSpecialization.builder()
                .mentor(mentor)
                .skill(skill)
                .build();

        mentorSpecializationRepository.save(spec);
    }

    @Transactional
    public void removeMentorSpecialization(Long mentorId, Long skillId) {
        mentorSpecializationRepository.deleteByMentorIdAndSkillSkillId(mentorId, skillId);
    }

    // Search students by skills
    public List<Long> findStudentsWithSkills(List<Long> skillIds) {
        return studentSkillRepository.findStudentsWithAllSkills(skillIds, (long) skillIds.size());
    }

    // Search mentors by skills
    public List<Long> findMentorsWithSkills(List<Long> skillIds) {
        return mentorSpecializationRepository.findMentorsWithAnySkill(skillIds);
    }

    private SkillDTO toSkillDTO(Skill skill) {
        return SkillDTO.builder()
                .skillId(skill.getSkillId())
                .skillName(skill.getSkillName())
                .category(skill.getCategory() != null ? skill.getCategory().name() : null)
                .build();
    }

    private StudentSkillDTO toStudentSkillDTO(StudentSkill studentSkill) {
        return StudentSkillDTO.builder()
                .studentId(studentSkill.getStudent().getId())
                .skillId(studentSkill.getSkill().getSkillId())
                .skillName(studentSkill.getSkill().getSkillName())
                .category(studentSkill.getSkill().getCategory() != null ? studentSkill.getSkill().getCategory().name()
                        : null)
                .proficiencyLevel(studentSkill.getProficiencyLevel().name())
                .build();
    }

    /**
     * Get skill analytics for a team - used for radar chart visualization
     */
    public SkillAnalyticsDTO getTeamSkillAnalytics(Long teamId) {
        Team team = teamRepository.findByIdWithDetails(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Collect all user IDs in the team (leader + members)
        Set<Long> userIds = new HashSet<>();
        userIds.add(team.getTeamLeader().getId());
        if (team.getMembers() != null) {
            team.getMembers().forEach(member -> {
                if (member.getUser() != null) {
                    userIds.add(member.getUser().getId());
                }
            });
        }

        // Get all skills for these users
        List<StudentSkill> allSkills = new ArrayList<>();
        for (Long userId : userIds) {
            allSkills.addAll(studentSkillRepository.findByStudentId(userId));
        }

        // Calculate category scores (average proficiency per category)
        Map<String, List<Integer>> categoryProficiencies = new HashMap<>();
        Map<String, List<SkillAnalyticsDTO.SkillBreakdown>> skillsByCategory = new HashMap<>();

        // Initialize all categories
        for (SkillCategory cat : SkillCategory.values()) {
            categoryProficiencies.put(cat.name(), new ArrayList<>());
        }

        // Process each skill
        Map<String, List<Integer>> skillProficiencies = new HashMap<>();
        for (StudentSkill ss : allSkills) {
            String category = ss.getSkill().getCategory() != null ? ss.getSkill().getCategory().name() : "OTHER";
            int profScore = proficiencyToScore(ss.getProficiencyLevel());

            categoryProficiencies.get(category).add(profScore);

            // Track individual skill proficiencies
            String skillName = ss.getSkill().getSkillName();
            skillProficiencies.computeIfAbsent(skillName, k -> new ArrayList<>()).add(profScore);
        }

        // Calculate average scores per category
        Map<String, Integer> categoryScores = new HashMap<>();
        for (Map.Entry<String, List<Integer>> entry : categoryProficiencies.entrySet()) {
            List<Integer> scores = entry.getValue();
            int avg = scores.isEmpty() ? 0 : (int) scores.stream().mapToInt(Integer::intValue).average().orElse(0);
            categoryScores.put(entry.getKey(), avg);
        }

        // Build skill breakdown
        List<SkillAnalyticsDTO.SkillBreakdown> skillBreakdown = new ArrayList<>();
        for (Map.Entry<String, List<Integer>> entry : skillProficiencies.entrySet()) {
            String skillName = entry.getKey();
            List<Integer> scores = entry.getValue();
            int avgProf = (int) scores.stream().mapToInt(Integer::intValue).average().orElse(0);

            // Find category for this skill
            String category = allSkills.stream()
                    .filter(ss -> ss.getSkill().getSkillName().equals(skillName))
                    .findFirst()
                    .map(ss -> ss.getSkill().getCategory() != null ? ss.getSkill().getCategory().name() : "OTHER")
                    .orElse("OTHER");

            skillBreakdown.add(SkillAnalyticsDTO.SkillBreakdown.builder()
                    .skillName(skillName)
                    .category(category)
                    .avgProficiency(avgProf)
                    .membersWithSkill(scores.size())
                    .build());
        }

        // Sort by proficiency descending
        skillBreakdown.sort((a, b) -> b.getAvgProficiency().compareTo(a.getAvgProficiency()));

        // Top skills (top 5 by proficiency)
        List<String> topSkills = skillBreakdown.stream()
                .limit(5)
                .map(SkillAnalyticsDTO.SkillBreakdown::getSkillName)
                .collect(Collectors.toList());

        // Missing skills - categories with score < 30
        List<String> missingSkills = categoryScores.entrySet().stream()
                .filter(e -> e.getValue() < 30)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Overall coverage - average of all category scores
        int overallCoverage = (int) categoryScores.values().stream()
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0);

        return SkillAnalyticsDTO.builder()
                .categoryScores(categoryScores)
                .skillBreakdown(skillBreakdown)
                .topSkills(topSkills)
                .missingSkills(missingSkills)
                .overallCoverage(overallCoverage)
                .teamMemberCount(userIds.size())
                .build();
    }

    private int proficiencyToScore(ProficiencyLevel level) {
        return switch (level) {
            case BEGINNER -> 33;
            case INTERMEDIATE -> 66;
            case ADVANCED -> 100;
        };
    }
}
