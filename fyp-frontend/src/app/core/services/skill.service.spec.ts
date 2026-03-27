import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SkillCatalogService, Skill, StudentSkill, SkillAnalytics } from './skill.service';

describe('SkillCatalogService', () => {
    let service: SkillCatalogService;
    let httpMock: HttpTestingController;

    const mockSkill: Skill = {
        skillId: 1,
        skillName: 'Angular',
        category: 'FRONTEND'
    };

    const mockStudentSkill: StudentSkill = {
        studentId: 1,
        skillId: 1,
        skillName: 'Angular',
        category: 'FRONTEND',
        proficiencyLevel: 'INTERMEDIATE'
    };

    const mockAnalytics: SkillAnalytics = {
        categoryScores: { 'FRONTEND': 85, 'BACKEND': 70 },
        skillBreakdown: [
            { skillName: 'Angular', category: 'FRONTEND', avgProficiency: 4, membersWithSkill: 3 }
        ],
        topSkills: ['Angular', 'Java'],
        missingSkills: ['Docker'],
        overallCoverage: 75,
        teamMemberCount: 4
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SkillCatalogService]
        });
        service = TestBed.inject(SkillCatalogService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllSkills', () => {
        it('should fetch all skills', () => {
            service.getAllSkills().subscribe(skills => {
                expect(skills.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills');
            expect(req.request.method).toBe('GET');
            req.flush([mockSkill]);
        });
    });

    describe('getCategories', () => {
        it('should fetch skill categories', () => {
            service.getCategories().subscribe(categories => {
                expect(categories).toContain('FRONTEND');
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/categories');
            expect(req.request.method).toBe('GET');
            req.flush(['FRONTEND', 'BACKEND', 'DATABASE']);
        });
    });

    describe('getSkillsByCategory', () => {
        it('should fetch skills by category', () => {
            service.getSkillsByCategory('FRONTEND').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/category/FRONTEND');
            expect(req.request.method).toBe('GET');
            req.flush([mockSkill]);
        });
    });

    describe('getSkill', () => {
        it('should fetch single skill by ID', () => {
            service.getSkill(1).subscribe(skill => {
                expect(skill).toEqual(mockSkill);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockSkill);
        });
    });

    describe('createSkill', () => {
        it('should send POST request to create skill', () => {
            service.createSkill(mockSkill).subscribe(result => {
                expect(result).toEqual(mockSkill);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills');
            expect(req.request.method).toBe('POST');
            req.flush(mockSkill);
        });
    });

    describe('getStudentSkills', () => {
        it('should fetch student skills', () => {
            service.getStudentSkills(1).subscribe(skills => {
                expect(skills.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/student/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockStudentSkill]);
        });
    });

    describe('addStudentSkill', () => {
        it('should send POST request to add student skill', () => {
            service.addStudentSkill(1, 1, 'INTERMEDIATE').subscribe(result => {
                expect(result).toEqual(mockStudentSkill);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/student/1');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ skillId: 1, proficiencyLevel: 'INTERMEDIATE' });
            req.flush(mockStudentSkill);
        });
    });

    describe('removeStudentSkill', () => {
        it('should send DELETE request to remove student skill', () => {
            service.removeStudentSkill(1, 1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/student/1/skill/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getMentorSpecializations', () => {
        it('should fetch mentor specializations', () => {
            service.getMentorSpecializations(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/mentor/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockSkill]);
        });
    });

    describe('addMentorSpecialization', () => {
        it('should send POST request to add mentor specialization', () => {
            service.addMentorSpecialization(1, 1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/mentor/1/skill/1');
            expect(req.request.method).toBe('POST');
            req.flush(null);
        });
    });

    describe('removeMentorSpecialization', () => {
        it('should send DELETE request to remove mentor specialization', () => {
            service.removeMentorSpecialization(1, 1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/mentor/1/skill/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('findStudentsWithSkills', () => {
        it('should send POST request to find students with skills', () => {
            service.findStudentsWithSkills([1, 2]).subscribe(userIds => {
                expect(userIds).toEqual([1, 2, 3]);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/search/students');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual([1, 2]);
            req.flush([1, 2, 3]);
        });
    });

    describe('findMentorsWithSkills', () => {
        it('should send POST request to find mentors with skills', () => {
            service.findMentorsWithSkills([1, 2]).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/search/mentors');
            expect(req.request.method).toBe('POST');
            req.flush([1, 2]);
        });
    });

    describe('getTeamSkillGraph', () => {
        it('should fetch team skill analytics', () => {
            service.getTeamSkillGraph(1).subscribe(analytics => {
                expect(analytics).toEqual(mockAnalytics);
                expect(analytics.overallCoverage).toBe(75);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/skills/teams/1/skill-graph');
            expect(req.request.method).toBe('GET');
            req.flush(mockAnalytics);
        });
    });
});
