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
    private final StudentProfileRepository studentProfileRepository;

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
     * Get skill analytics for a team - used for radar chart visualization.
     * Aggregates skills from both the student_skills table (with proficiency)
     * and the student_profile_skills table (free-text skills from profile).
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

        // Use a simple data structure to track skill entries per user
        // Each entry: skillName, category, proficiency score
        List<SkillEntry> allEntries = new ArrayList<>();

        for (Long userId : userIds) {
            // Track which skills we've already added for this user to avoid duplicates per-user
            Set<String> addedSkillsForUser = new HashSet<>();

            // 1. Include skills from StudentSkill table (these have explicit proficiency)
            List<StudentSkill> studentSkills = studentSkillRepository.findByStudentId(userId);
            for (StudentSkill ss : studentSkills) {
                String skillName = ss.getSkill().getSkillName().toLowerCase();
                if (addedSkillsForUser.add(skillName)) {
                    String category = ss.getSkill().getCategory() != null
                            ? ss.getSkill().getCategory().name() : "OTHER";
                    allEntries.add(new SkillEntry(
                            ss.getSkill().getSkillName(),
                            category,
                            proficiencyToScore(ss.getProficiencyLevel())));
                }
            }

            // 2. Include skills from StudentProfile (free-text skill list)
            StudentProfile profile = studentProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null && profile.getSkills() != null) {
                for (String profileSkillName : profile.getSkills()) {
                    if (profileSkillName == null || profileSkillName.trim().isEmpty()) continue;
                    String normalizedName = profileSkillName.trim().toLowerCase();
                    if (addedSkillsForUser.add(normalizedName)) {
                        // Try to match against the skills catalog for category info
                        Optional<Skill> skillOpt = skillRepository.findBySkillNameIgnoreCase(profileSkillName.trim());
                        String category;
                        String displayName;
                        if (skillOpt.isPresent()) {
                            category = skillOpt.get().getCategory() != null
                                    ? skillOpt.get().getCategory().name() : "OTHER";
                            displayName = skillOpt.get().getSkillName();
                        } else {
                            // Skill not in catalog - try to auto-categorize, default to OTHER
                            category = guessCategoryForSkill(profileSkillName.trim());
                            displayName = profileSkillName.trim();
                        }
                        // Assume INTERMEDIATE proficiency for profile-listed skills
                        allEntries.add(new SkillEntry(displayName, category,
                                proficiencyToScore(ProficiencyLevel.INTERMEDIATE)));
                    }
                }
            }
        }

        // Calculate category scores (average proficiency per category)
        Map<String, List<Integer>> categoryProficiencies = new HashMap<>();

        // Initialize all categories
        for (SkillCategory cat : SkillCategory.values()) {
            categoryProficiencies.put(cat.name(), new ArrayList<>());
        }

        // Process each skill entry
        Map<String, List<Integer>> skillProficiencies = new HashMap<>();
        Map<String, String> skillCategoryMap = new HashMap<>();
        for (SkillEntry entry : allEntries) {
            categoryProficiencies.computeIfAbsent(entry.category, k -> new ArrayList<>()).add(entry.profScore);

            // Track individual skill proficiencies (normalize by display name)
            skillProficiencies.computeIfAbsent(entry.skillName, k -> new ArrayList<>()).add(entry.profScore);
            skillCategoryMap.putIfAbsent(entry.skillName, entry.category);
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
            String category = skillCategoryMap.getOrDefault(skillName, "OTHER");

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

    /**
     * Simple helper class to hold skill data during analytics aggregation.
     */
    private static class SkillEntry {
        final String skillName;
        final String category;
        final int profScore;

        SkillEntry(String skillName, String category, int profScore) {
            this.skillName = skillName;
            this.category = category;
            this.profScore = profScore;
        }
    }

    /**
     * Attempts to guess the skill category based on common keyword patterns.
     * Falls back to OTHER if no pattern matches.
     */
    private String guessCategoryForSkill(String skillName) {
        String lower = skillName.toLowerCase();

        // Frontend patterns
        if (lower.matches(".*(react|angular|vue|svelte|html|css|sass|scss|tailwind|bootstrap|javascript|typescript|jquery|next\\.?js|nuxt|gatsby|webpack|vite|redux|frontend|front-end|ui|ux).*")) {
            return "FRONTEND";
        }
        // Backend patterns
        if (lower.matches(".*(java|spring|node|express|django|flask|fastapi|ruby|rails|php|laravel|\\.net|asp|golang|go|rust|backend|back-end|api|rest|graphql|microservice|servlet|hibernate|maven|gradle).*")) {
            return "BACKEND";
        }
        // Database patterns
        if (lower.matches(".*(sql|mysql|postgres|mongodb|redis|firebase|dynamodb|cassandra|oracle|database|db|nosql|elasticsearch|neo4j|sqlite|mariadb).*")) {
            return "DATABASE";
        }
        // ML/AI patterns
        if (lower.matches(".*(machine.?learning|deep.?learning|ai|artificial|tensorflow|pytorch|keras|nlp|computer.?vision|neural|data.?science|pandas|numpy|scikit|opencv|ml|llm|gpt|transformer|bert).*")) {
            return "ML";
        }
        // Testing patterns
        if (lower.matches(".*(test|jest|junit|selenium|cypress|mocha|pytest|tdd|bdd|qa|quality|automation|postman|cucumber|mockito|karma|jasmine).*")) {
            return "TESTING";
        }
        // DevOps patterns
        if (lower.matches(".*(docker|kubernetes|k8s|jenkins|ci.?cd|devops|terraform|ansible|linux|nginx|apache|git|github.?actions|gitlab|bitbucket|bash|shell|monitoring|prometheus|grafana).*")) {
            return "DEVOPS";
        }
        // Mobile patterns
        if (lower.matches(".*(android|ios|swift|kotlin|flutter|react.?native|mobile|xamarin|ionic|dart|objective.?c|swiftui|jetpack).*")) {
            return "MOBILE";
        }
        // Cloud patterns
        if (lower.matches(".*(aws|azure|gcp|google.?cloud|heroku|cloud|serverless|lambda|s3|ec2|vercel|netlify|digital.?ocean|cloudflare).*")) {
            return "CLOUD";
        }

        return "OTHER";
    }

    private int proficiencyToScore(ProficiencyLevel level) {
        return switch (level) {
            case BEGINNER -> 33;
            case INTERMEDIATE -> 66;
            case ADVANCED -> 100;
        };
    }
}
