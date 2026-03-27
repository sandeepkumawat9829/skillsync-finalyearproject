package com.fyp.service;

import com.fyp.model.dto.SkillDTO;
import com.fyp.model.dto.StudentSkillDTO;
import com.fyp.model.entity.*;
import com.fyp.model.entity.Skill.SkillCategory;
import com.fyp.model.entity.StudentSkill.ProficiencyLevel;
import com.fyp.repository.MentorSpecializationRepository;
import com.fyp.repository.SkillRepository;
import com.fyp.repository.StudentSkillRepository;
import com.fyp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SkillService Tests")
class SkillServiceTest {

    @Mock
    private SkillRepository skillRepository;
    @Mock
    private StudentSkillRepository studentSkillRepository;
    @Mock
    private MentorSpecializationRepository mentorSpecializationRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SkillService skillService;

    private Skill skill;
    private User student;
    private User mentor;
    private StudentSkill studentSkill;

    @BeforeEach
    void setUp() {
        skill = Skill.builder()
                .skillId(1L)
                .skillName("Java")
                .category(SkillCategory.BACKEND)
                .build();

        student = User.builder()
                .id(1L)
                .email("student@example.com")
                .build();

        mentor = User.builder()
                .id(2L)
                .email("mentor@example.com")
                .build();

        studentSkill = StudentSkill.builder()
                .student(student)
                .skill(skill)
                .proficiencyLevel(ProficiencyLevel.INTERMEDIATE)
                .build();
    }

    @Test
    @DisplayName("Get all skills - Should return list")
    void getAllSkills_ShouldReturnList() {
        when(skillRepository.findAllByOrderBySkillNameAsc()).thenReturn(Arrays.asList(skill));

        List<SkillDTO> result = skillService.getAllSkills();

        assertEquals(1, result.size());
        assertEquals("Java", result.get(0).getSkillName());
    }

    @Test
    @DisplayName("Create Skill - Should save and return DTO")
    void createSkill_ShouldSave() {
        SkillDTO dto = SkillDTO.builder().skillName("Java").category("BACKEND").build();
        when(skillRepository.findBySkillNameIgnoreCase("Java")).thenReturn(Optional.empty());
        when(skillRepository.save(any(Skill.class))).thenReturn(skill);

        SkillDTO result = skillService.createSkill(dto);

        assertNotNull(result);
        assertEquals("Java", result.getSkillName());
        verify(skillRepository).save(any(Skill.class));
    }

    @Test
    @DisplayName("Create Skill - Should fail if exists")
    void createSkill_ShouldFailIfExists() {
        SkillDTO dto = SkillDTO.builder().skillName("Java").category("BACKEND").build();
        when(skillRepository.findBySkillNameIgnoreCase("Java")).thenReturn(Optional.of(skill));

        assertThrows(RuntimeException.class, () -> skillService.createSkill(dto));
    }

    @Test
    @DisplayName("Add Student Skill - Should save association")
    void addStudentSkill_ShouldSave() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));
        when(studentSkillRepository.save(any(StudentSkill.class))).thenReturn(studentSkill);

        StudentSkillDTO result = skillService.addStudentSkill(1L, 1L, "INTERMEDIATE");

        assertNotNull(result);
        assertEquals("Java", result.getSkillName());
        assertEquals("INTERMEDIATE", result.getProficiencyLevel());
    }

    @Test
    @DisplayName("Remove Student Skill - Should delete")
    void removeStudentSkill_ShouldDelete() {
        skillService.removeStudentSkill(1L, 1L);
        verify(studentSkillRepository).deleteByStudentIdAndSkillSkillId(1L, 1L);
    }

    @Test
    @DisplayName("Add Mentor Specialization - Should save")
    void addMentorSpecialization_ShouldSave() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(mentor));
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));

        skillService.addMentorSpecialization(2L, 1L);

        verify(mentorSpecializationRepository).save(any(MentorSpecialization.class));
    }

    @Test
    @DisplayName("Find Students With Skills - Should search repo")
    void findStudentsWithSkills_ShouldSearch() {
        List<Long> skillIds = Arrays.asList(1L, 2L);
        when(studentSkillRepository.findStudentsWithAllSkills(skillIds, 2L))
                .thenReturn(Arrays.asList(1L));

        List<Long> result = skillService.findStudentsWithSkills(skillIds);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0));
    }

    @Test
    @DisplayName("Get Skills By Category - Should return filtered list")
    void getSkillsByCategory_ShouldReturnList() {
        when(skillRepository.findByCategoryOrderBySkillNameAsc(SkillCategory.BACKEND))
                .thenReturn(Arrays.asList(skill));

        List<SkillDTO> result = skillService.getSkillsByCategory("BACKEND");

        assertEquals(1, result.size());
        assertEquals("Java", result.get(0).getSkillName());
    }

    @Test
    @DisplayName("Get Categories - Should return list of category names")
    void getCategories_ShouldReturnList() {
        List<String> result = skillService.getCategories();
        assertFalse(result.isEmpty());
        assertTrue(result.contains("BACKEND"));
    }

    @Test
    @DisplayName("Get Skill - Should return DTO")
    void getSkill_ShouldReturnDTO() {
        when(skillRepository.findById(1L)).thenReturn(Optional.of(skill));

        SkillDTO result = skillService.getSkill(1L);

        assertNotNull(result);
        assertEquals("Java", result.getSkillName());
    }

    @Test
    @DisplayName("Get Skill - Should throw if not found")
    void getSkill_ShouldThrowIfNotFound() {
        when(skillRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> skillService.getSkill(1L));
    }

    @Test
    @DisplayName("Get Student Skills - Should return list")
    void getStudentSkills_ShouldReturnList() {
        when(studentSkillRepository.findByStudentId(1L)).thenReturn(Arrays.asList(studentSkill));

        List<StudentSkillDTO> result = skillService.getStudentSkills(1L);

        assertEquals(1, result.size());
        assertEquals("Java", result.get(0).getSkillName());
    }

    @Test
    @DisplayName("Get Mentor Specializations - Should return list")
    void getMentorSpecializations_ShouldReturnList() {
        MentorSpecialization ms = MentorSpecialization.builder()
                .mentor(mentor)
                .skill(skill)
                .build();
        when(mentorSpecializationRepository.findByMentorId(2L)).thenReturn(Arrays.asList(ms));

        List<SkillDTO> result = skillService.getMentorSpecializations(2L);

        assertEquals(1, result.size());
        assertEquals("Java", result.get(0).getSkillName());
    }

    @Test
    @DisplayName("Remove Mentor Specialization - Should delete")
    void removeMentorSpecialization_ShouldDelete() {
        skillService.removeMentorSpecialization(2L, 1L);
        verify(mentorSpecializationRepository).deleteByMentorIdAndSkillSkillId(2L, 1L);
    }

    @Test
    @DisplayName("Find Mentors With Skills - Should search repo")
    void findMentorsWithSkills_ShouldSearch() {
        List<Long> skillIds = Arrays.asList(1L);
        when(mentorSpecializationRepository.findMentorsWithAnySkill(skillIds))
                .thenReturn(Arrays.asList(2L));

        List<Long> result = skillService.findMentorsWithSkills(skillIds);

        assertEquals(1, result.size());
        assertEquals(2L, result.get(0));
    }
}
