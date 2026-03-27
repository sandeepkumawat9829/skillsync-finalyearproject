package com.fyp.dev;

import com.fyp.model.entity.MentorAssignment;
import com.fyp.model.entity.MentorProfile;
import com.fyp.model.entity.MentorSpecialization;
import com.fyp.model.entity.Project;
import com.fyp.model.entity.ProjectBucket;
import com.fyp.model.entity.Skill;
import com.fyp.model.entity.StudentProfile;
import com.fyp.model.entity.StudentSkill;
import com.fyp.model.entity.Team;
import com.fyp.model.entity.TeamMember;
import com.fyp.model.entity.User;
import com.fyp.model.entity.ProjectShowcase;
import com.fyp.model.enums.MemberRole;
import com.fyp.model.enums.ProjectStatus;
import com.fyp.model.enums.Role;
import com.fyp.model.enums.TeamStatus;
import com.fyp.repository.MentorAssignmentRepository;
import com.fyp.repository.MentorProfileRepository;
import com.fyp.repository.MentorSpecializationRepository;
import com.fyp.repository.ProjectBucketRepository;
import com.fyp.repository.ProjectRepository;
import com.fyp.repository.ProjectShowcaseRepository;
import com.fyp.repository.SkillRepository;
import com.fyp.repository.StudentProfileRepository;
import com.fyp.repository.StudentSkillRepository;
import com.fyp.repository.TeamMemberRepository;
import com.fyp.repository.TeamRepository;
import com.fyp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements CommandLineRunner {

    private static final String SEED_ADMIN_EMAIL = "admin@fyp.test";
    private static final String DEFAULT_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final ProjectBucketRepository projectBucketRepository;
    private final ProjectRepository projectRepository;
    private final ProjectShowcaseRepository projectShowcaseRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final MentorSpecializationRepository mentorSpecializationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        boolean alreadySeeded = userRepository.existsByEmailIgnoreCase(SEED_ADMIN_EMAIL);
        if (alreadySeeded) {
            log.info("Dev seed users already present ({}). Ensuring showcase seed exists.", SEED_ADMIN_EMAIL);
            ensureSeedShowcase();
            return;
        }

        log.info("Seeding dev data (users, profiles, buckets, projects, teams)...");

        // Admin
        User admin = createUser(SEED_ADMIN_EMAIL, Role.ADMIN, DEFAULT_PASSWORD, true);

        // Mentors
        User mentor1 = createUser("mentor.ai@fyp.test", Role.MENTOR, DEFAULT_PASSWORD, true);
        User mentor2 = createUser("mentor.web@fyp.test", Role.MENTOR, DEFAULT_PASSWORD, true);
        User mentor3 = createUser("mentor.data@fyp.test", Role.MENTOR, DEFAULT_PASSWORD, true);

        createMentorProfile(mentor1, "Dr. Aditi Sharma", "EMP1001", "CSE", "Associate Professor",
                "9876543210", "Block A - 2nd Floor",
                "Guides applied ML projects and research-to-product workflows.");
        createMentorProfile(mentor2, "Prof. Rohan Mehta", "EMP1002", "CSE", "Assistant Professor",
                "9876501234", "Block B - Lab 3",
                "Focus on scalable full-stack systems with secure architectures.");
        createMentorProfile(mentor3, "Dr. Neha Iyer", "EMP1003", "IT", "Professor",
                "9876512345", "Block C - Cabin 12",
                "Mentors data platforms, pipelines, and dashboards.");

        // Students
        User s1 = createUser("student.aarav@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);
        User s2 = createUser("student.diyaa@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);
        User s3 = createUser("student.kabir@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);
        User s4 = createUser("student.anaya@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);
        User s5 = createUser("student.ishan@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);
        User s6 = createUser("student.mehak@fyp.test", Role.STUDENT, DEFAULT_PASSWORD, true);

        createStudentProfile(s1, "Aarav Gupta", "22CSE001", "CSE", 8, new BigDecimal("8.42"), "9991112233",
                "Backend-oriented builder who enjoys clean APIs.",
                "https://github.com/aarav-gupta", "https://linkedin.com/in/aarav-gupta", null);
        createStudentProfile(s2, "Diya Verma", "22CSE014", "CSE", 8, new BigDecimal("8.10"), "9992223344",
                "Frontend + UX enthusiast.",
                "https://github.com/diya-verma", "https://linkedin.com/in/diya-verma", null);
        createStudentProfile(s3, "Kabir Singh", "22CSE023", "CSE", 8, new BigDecimal("7.95"), "9993334455",
                "Enjoys real-time systems and performance.",
                "https://github.com/kabir-singh", "https://linkedin.com/in/kabir-singh", null);
        createStudentProfile(s4, "Anaya Patel", "22CSE031", "CSE", 8, new BigDecimal("8.76"), "9994445566",
                "Data-driven product thinker.",
                "https://github.com/anaya-patel", "https://linkedin.com/in/anaya-patel", null);
        createStudentProfile(s5, "Ishan Kumar", "22IT009", "IT", 8, new BigDecimal("7.88"), "9995556677",
                "Likes analytics and dashboards.",
                "https://github.com/ishan-kumar", "https://linkedin.com/in/ishan-kumar", null);
        createStudentProfile(s6, "Mehak Jain", "22IT017", "IT", 8, new BigDecimal("8.02"), "9996667788",
                "Security-minded full stack dev.",
                "https://github.com/mehak-jain", "https://linkedin.com/in/mehak-jain", null);

        // Skills + links (student_skills / mentor_specializations)
        Skill java = getOrCreateSkill("Java", Skill.SkillCategory.BACKEND);
        Skill springBoot = getOrCreateSkill("Spring Boot", Skill.SkillCategory.BACKEND);
        Skill postgres = getOrCreateSkill("PostgreSQL", Skill.SkillCategory.DATABASE);
        Skill docker = getOrCreateSkill("Docker", Skill.SkillCategory.DEVOPS);
        Skill angular = getOrCreateSkill("Angular", Skill.SkillCategory.FRONTEND);
        Skill typescript = getOrCreateSkill("TypeScript", Skill.SkillCategory.FRONTEND);
        Skill scss = getOrCreateSkill("SCSS", Skill.SkillCategory.FRONTEND);
        Skill websocket = getOrCreateSkill("WebSocket", Skill.SkillCategory.BACKEND);
        Skill security = getOrCreateSkill("Security", Skill.SkillCategory.OTHER);
        Skill python = getOrCreateSkill("Python", Skill.SkillCategory.ML);
        Skill ml = getOrCreateSkill("Machine Learning", Skill.SkillCategory.ML);
        Skill sql = getOrCreateSkill("SQL", Skill.SkillCategory.DATABASE);
        Skill cloud = getOrCreateSkill("Cloud", Skill.SkillCategory.CLOUD);

        linkMentorSkills(mentor1, List.of(python, ml));
        linkMentorSkills(mentor2, List.of(angular, security, cloud));
        linkMentorSkills(mentor3, List.of(sql, postgres));

        linkStudentSkills(s1, List.of(java, springBoot, postgres, docker), StudentSkill.ProficiencyLevel.INTERMEDIATE);
        linkStudentSkills(s2, List.of(angular, typescript, scss), StudentSkill.ProficiencyLevel.INTERMEDIATE);
        linkStudentSkills(s3, List.of(websocket, typescript), StudentSkill.ProficiencyLevel.BEGINNER);
        linkStudentSkills(s4, List.of(python, ml), StudentSkill.ProficiencyLevel.INTERMEDIATE);
        linkStudentSkills(s5, List.of(sql, postgres), StudentSkill.ProficiencyLevel.BEGINNER);
        linkStudentSkills(s6, List.of(security, springBoot, angular), StudentSkill.ProficiencyLevel.INTERMEDIATE);

        // Project buckets (public browse/test)
        ProjectBucket b1 = projectBucketRepository.save(ProjectBucket.builder()
                .title("AI-Powered Skill Matching for Teams")
                .description("Recommend team formation based on complementary skills, interests, and workload. Include explainable recommendations and fairness checks.")
                .department("CSE")
                .technologies(List.of("Python", "Embeddings", "Angular", "Spring Boot"))
                .difficultyLevel(ProjectBucket.DifficultyLevel.HARD)
                .maxTeams(2)
                .allocatedTeams(1)
                .isAvailable(true)
                .postedBy(mentor1)
                .deadline(LocalDateTime.now().plusDays(30))
                .build());

        ProjectBucket b2 = projectBucketRepository.save(ProjectBucket.builder()
                .title("Secure Document Versioning & Review Portal")
                .description("Document uploads with versioning, review workflows, audit trail, and role-based access for students/mentors/admin.")
                .department("CSE")
                .technologies(List.of("Spring Security", "JWT", "Cloudinary", "Angular Material"))
                .difficultyLevel(ProjectBucket.DifficultyLevel.MEDIUM)
                .maxTeams(3)
                .allocatedTeams(0)
                .isAvailable(true)
                .postedBy(mentor2)
                .deadline(LocalDateTime.now().plusDays(45))
                .build());

        ProjectBucket b3 = projectBucketRepository.save(ProjectBucket.builder()
                .title("Progress Analytics Dashboard for FYP")
                .description("Build dashboards showing milestones, time tracking, and team health metrics with drill-down views.")
                .department("IT")
                .technologies(List.of("Chart.js", "SQL", "ETL", "Angular"))
                .difficultyLevel(ProjectBucket.DifficultyLevel.EASY)
                .maxTeams(2)
                .allocatedTeams(0)
                .isAvailable(true)
                .postedBy(mentor3)
                .deadline(LocalDateTime.now().plusDays(25))
                .build());

        // Projects + Teams
        Project p1 = projectRepository.save(Project.builder()
                .title("FYP Management System (Seed Demo)")
                .abstractText("A full lifecycle system for students, mentors, and admins: teams, milestones, chat, documents, analytics.")
                .fullDescription("Seeded project to validate team formation, mentor assignment, and bucket browsing.")
                .problemStatement("Manual tracking of FYP progress leads to delays, poor communication, and missing evidence.")
                .objectives("Centralize collaboration and approvals; provide analytics.")
                .methodology("Agile sprints with weekly milestones; CI/CD; role-based workflows.")
                .expectedOutcome("A reliable portal that improves transparency and throughput.")
                .technologies(List.of("Angular", "Spring Boot", "H2/PostgreSQL", "WebSocket"))
                .domain("Education")
                .createdBy(s1)
                .isFromBucket(false)
                .status(ProjectStatus.IN_PROGRESS)
                .visibility("PUBLIC")
                .githubRepoUrl("https://github.com/example/fyp-management-system")
                .build());

        Team t1 = teamRepository.save(Team.builder()
                .teamName("Team Orion")
                .project(p1)
                .teamLeader(s1)
                .maxMembers(4)
                .currentMemberCount(3)
                .isComplete(false)
                .status(TeamStatus.ACTIVE)
                .build());

        teamMemberRepository.save(TeamMember.builder().team(t1).user(s1).role(MemberRole.LEADER).contributionScore(85).build());
        teamMemberRepository.save(TeamMember.builder().team(t1).user(s2).role(MemberRole.MEMBER).contributionScore(72).build());
        teamMemberRepository.save(TeamMember.builder().team(t1).user(s6).role(MemberRole.MEMBER).contributionScore(68).build());

        mentorAssignmentRepository.save(MentorAssignment.builder()
                .team(t1)
                .mentor(mentor2)
                .project(p1)
                .status("ACTIVE")
                .build());

        // Publish one showcase entry so the Showcase Gallery isn't empty in dev.
        projectShowcaseRepository.save(ProjectShowcase.builder()
                .project(p1)
                .isPublished(true)
                .academicYear("2025-26")
                .githubUrl(p1.getGithubRepoUrl())
                .awards(List.of("Best UX", "Most Impactful"))
                .tags(List.of("FYP", "Collaboration", "Analytics"))
                .publishedAt(LocalDateTime.now().minusDays(2))
                .viewsCount(128)
                .likesCount(12)
                .build());

        Project p2 = projectRepository.save(Project.builder()
                .title("Realtime Chat & Notifications")
                .abstractText("WebSocket-driven chat and notifications for mentor/student communication.")
                .fullDescription("Seeded project to validate messaging UI and notifications feed.")
                .problemStatement("Email-based updates are delayed and hard to track.")
                .objectives("Instant collaboration and structured notifications.")
                .methodology("WebSocket + persistence + RBAC.")
                .expectedOutcome("Reduced turnaround time for reviews and decisions.")
                .technologies(List.of("Spring WebSocket", "STOMP", "Angular", "JWT"))
                .domain("Collaboration")
                .createdBy(s3)
                .isFromBucket(true)
                .status(ProjectStatus.TEAM_FORMING)
                .visibility("PUBLIC")
                .githubRepoUrl("https://github.com/example/realtime-fyp")
                .build());

        Team t2 = teamRepository.save(Team.builder()
                .teamName("Team Nova")
                .project(p2)
                .teamLeader(s3)
                .maxMembers(4)
                .currentMemberCount(2)
                .isComplete(false)
                .status(TeamStatus.FORMING)
                .build());

        teamMemberRepository.save(TeamMember.builder().team(t2).user(s3).role(MemberRole.LEADER).contributionScore(60).build());
        teamMemberRepository.save(TeamMember.builder().team(t2).user(s4).role(MemberRole.MEMBER).contributionScore(55).build());

        // A project intended to be "picked from bucket"
        projectRepository.save(Project.builder()
                .title("Bucket Project: " + b1.getTitle())
                .abstractText("Team formation using skill matching; seeded from the college bucket.")
                .fullDescription(b1.getDescription())
                .problemStatement("Hard to form balanced teams with complementary skills.")
                .objectives("Recommend teammates; provide justification; avoid bias.")
                .methodology("Hybrid scoring + explainability; A/B evaluation.")
                .expectedOutcome("Better team cohesion and higher completion rates.")
                // Important: never reuse the same List instance across entities (Hibernate will error)
                .technologies(new ArrayList<>(b1.getTechnologies()))
                .domain("AI/ML")
                .createdBy(s5)
                .isFromBucket(true)
                .status(ProjectStatus.DRAFT)
                .visibility("PUBLIC")
                .githubRepoUrl(null)
                .build());

        log.info("Dev seed complete. Login emails use password: {}", DEFAULT_PASSWORD);
        log.info("Admin: {}", SEED_ADMIN_EMAIL);
        log.info("Mentors: mentor.ai@fyp.test, mentor.web@fyp.test, mentor.data@fyp.test");
        log.info("Students: student.aarav@fyp.test, student.diyaa@fyp.test, student.kabir@fyp.test, student.anaya@fyp.test, student.ishan@fyp.test, student.mehak@fyp.test");
    }

    private void ensureSeedShowcase() {
        Project seedProject = projectRepository.findAll().stream()
                .filter(p -> "FYP Management System (Seed Demo)".equals(p.getTitle()))
                .findFirst()
                .orElse(null);
        if (seedProject == null) {
            log.info("Seed project not found; skipping showcase seed.");
            return;
        }
        if (projectShowcaseRepository.findByProjectId(seedProject.getId()).isPresent()) {
            log.info("Showcase already exists for seed project.");
            return;
        }
        projectShowcaseRepository.save(ProjectShowcase.builder()
                .project(seedProject)
                .isPublished(true)
                .academicYear("2025-26")
                .githubUrl(seedProject.getGithubRepoUrl())
                .awards(List.of("Best UX", "Most Impactful"))
                .tags(List.of("FYP", "Collaboration", "Analytics"))
                .publishedAt(LocalDateTime.now().minusDays(2))
                .viewsCount(128)
                .likesCount(12)
                .build());
        log.info("Seed showcase created.");
    }

    private User createUser(String email, Role role, String rawPassword, boolean verifiedAndCompleted) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .isActive(true)
                .enabled(true)
                .emailVerified(verifiedAndCompleted)
                .profileCompleted(verifiedAndCompleted)
                .build();
        return userRepository.save(user);
    }

    private void createStudentProfile(
            User user,
            String fullName,
            String enrollmentNumber,
            String branch,
            Integer semester,
            BigDecimal cgpa,
            String phone,
            String bio,
            String githubUrl,
            String linkedinUrl,
            String portfolioUrl
    ) {
        if (studentProfileRepository.existsByEnrollmentNumber(enrollmentNumber)) return;

        studentProfileRepository.save(StudentProfile.builder()
                .user(user)
                .fullName(fullName)
                .enrollmentNumber(enrollmentNumber)
                .branch(branch)
                .currentSemester(semester)
                .cgpa(cgpa)
                .phone(phone)
                .bio(bio)
                .githubUrl(githubUrl)
                .linkedinUrl(linkedinUrl)
                .portfolioUrl(portfolioUrl)
                .profileImageUrl(null)
                .build());
    }

    private void createMentorProfile(
            User user,
            String fullName,
            String employeeId,
            String department,
            String designation,
            String phone,
            String officeLocation,
            String bio
    ) {
        if (mentorProfileRepository.existsByEmployeeId(employeeId)) return;

        mentorProfileRepository.save(MentorProfile.builder()
                .user(user)
                .fullName(fullName)
                .employeeId(employeeId)
                .department(department)
                .designation(designation)
                .maxProjectsAllowed(5)
                .currentProjectCount(1)
                .phone(phone)
                .officeLocation(officeLocation)
                .bio(bio)
                .profileImageUrl(null)
                .build());
    }

    private Skill getOrCreateSkill(String name, Skill.SkillCategory category) {
        return skillRepository.findBySkillNameIgnoreCase(name)
                .orElseGet(() -> skillRepository.save(Skill.builder().skillName(name).category(category).build()));
    }

    private void linkStudentSkills(User student, List<Skill> skills, StudentSkill.ProficiencyLevel level) {
        for (Skill skill : skills) {
            studentSkillRepository.save(StudentSkill.builder()
                    .student(student)
                    .skill(skill)
                    .proficiencyLevel(level)
                    .build());
        }
    }

    private void linkMentorSkills(User mentor, List<Skill> skills) {
        for (Skill skill : skills) {
            mentorSpecializationRepository.save(MentorSpecialization.builder()
                    .mentor(mentor)
                    .skill(skill)
                    .build());
        }
    }
}

