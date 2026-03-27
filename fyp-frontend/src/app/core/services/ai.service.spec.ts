import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AIService, StudentSuggestion, PlagiarismResult } from './ai.service';

describe('AIService', () => {
    let service: AIService;
    let httpMock: HttpTestingController;

    const mockSuggestion: StudentSuggestion = {
        id: 1,
        userId: 1,
        fullName: 'John Doe',
        enrollmentNumber: 'ENR001',
        branch: 'Computer Science',
        currentSemester: 6,
        skills: ['Python', 'Machine Learning'],
        githubUrl: 'https://github.com/john',
        matchScore: 85
    };

    const mockPlagiarismResult: PlagiarismResult = {
        projectId: 1,
        similarityScore: 15,
        similarProjects: [
            { projectId: 2, projectTitle: 'Similar Project', similarity: 15 }
        ],
        status: 'LOW_SIMILARITY'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AIService]
        });
        service = TestBed.inject(AIService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('suggestTeamMembers', () => {
        it('should fetch team member suggestions with default limit', () => {
            service.suggestTeamMembers(1).subscribe(suggestions => {
                expect(suggestions.length).toBe(1);
                expect(suggestions[0].matchScore).toBe(85);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/ai/projects/1/suggest-members?limit=10');
            expect(req.request.method).toBe('GET');
            req.flush([mockSuggestion]);
        });

        it('should fetch team member suggestions with custom limit', () => {
            service.suggestTeamMembers(1, 5).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/ai/projects/1/suggest-members?limit=5');
            expect(req.request.method).toBe('GET');
            req.flush([mockSuggestion]);
        });
    });

    describe('checkPlagiarism', () => {
        it('should fetch plagiarism check results', () => {
            service.checkPlagiarism(1).subscribe(result => {
                expect(result).toEqual(mockPlagiarismResult);
                expect(result.status).toBe('LOW_SIMILARITY');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/ai/projects/1/plagiarism-check');
            expect(req.request.method).toBe('GET');
            req.flush(mockPlagiarismResult);
        });

        it('should handle high similarity result', () => {
            const highSimilarity: PlagiarismResult = {
                ...mockPlagiarismResult,
                similarityScore: 80,
                status: 'HIGH_SIMILARITY'
            };

            service.checkPlagiarism(1).subscribe(result => {
                expect(result.status).toBe('HIGH_SIMILARITY');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/ai/projects/1/plagiarism-check');
            req.flush(highSimilarity);
        });
    });
});
