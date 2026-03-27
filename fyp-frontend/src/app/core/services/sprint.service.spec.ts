import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SprintService } from './sprint.service';
import { Sprint, SprintStatus, SprintRetrospective, CreateSprintRequest } from '../models/sprint.model';

describe('SprintService', () => {
    let service: SprintService;
    let httpMock: HttpTestingController;

    const mockSprint: Sprint = {
        sprintId: 1,
        projectId: 1,
        sprintNumber: 1,
        sprintName: 'Sprint 1',
        sprintGoal: 'Complete user authentication',
        startDate: new Date(),
        endDate: new Date(),
        status: SprintStatus.ACTIVE,
        totalPoints: 20,
        completedPoints: 10,
        velocity: 10,
        createdAt: new Date()
    };

    const mockRetrospective: SprintRetrospective = {
        sprintId: 1,
        whatWentWell: 'Good teamwork',
        whatNeedsImprovement: 'Communication',
        actionItems: ['Daily standups'],
        createdBy: 1,
        createdAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SprintService]
        });
        service = TestBed.inject(SprintService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getSprintsByProject', () => {
        it('should fetch sprints by project ID', () => {
            service.getSprintsByProject(1).subscribe(sprints => {
                expect(sprints.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/project/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockSprint]);
        });
    });

    describe('getActiveSprint', () => {
        it('should fetch active sprint for project', () => {
            service.getActiveSprint(1).subscribe(sprint => {
                expect(sprint?.status).toBe(SprintStatus.ACTIVE);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/project/1/active');
            expect(req.request.method).toBe('GET');
            req.flush(mockSprint);
        });

        it('should return null when no active sprint', () => {
            service.getActiveSprint(1).subscribe(sprint => {
                expect(sprint).toBeNull();
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/project/1/active');
            req.flush(null);
        });
    });

    describe('getSprintById', () => {
        it('should fetch sprint by ID', () => {
            service.getSprintById(1).subscribe(sprint => {
                expect(sprint).toEqual(mockSprint);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockSprint);
        });
    });

    describe('createSprint', () => {
        it('should send POST request to create sprint', () => {
            const request: CreateSprintRequest = {
                projectId: 1,
                sprintName: 'Sprint 2',
                sprintGoal: 'Complete features',
                startDate: new Date(),
                durationWeeks: 2
            };

            service.createSprint(request).subscribe(result => {
                expect(result).toEqual(mockSprint);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints');
            expect(req.request.method).toBe('POST');
            req.flush(mockSprint);
        });
    });

    describe('startSprint', () => {
        it('should send POST request to start sprint', () => {
            service.startSprint(1).subscribe(result => {
                expect(result).toEqual(mockSprint);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1/start');
            expect(req.request.method).toBe('POST');
            req.flush(mockSprint);
        });
    });

    describe('completeSprint', () => {
        it('should send POST request to complete sprint', () => {
            service.completeSprint(1).subscribe(result => {
                expect(result).toEqual(mockSprint);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1/complete');
            expect(req.request.method).toBe('POST');
            req.flush(mockSprint);
        });
    });

    describe('deleteSprint', () => {
        it('should send DELETE request', () => {
            service.deleteSprint(1).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getSprintRetrospective', () => {
        it('should fetch sprint retrospective', () => {
            service.getSprintRetrospective(1).subscribe(retro => {
                expect(retro).toEqual(mockRetrospective);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1/retrospective');
            expect(req.request.method).toBe('GET');
            req.flush(mockRetrospective);
        });
    });

    describe('saveRetrospective', () => {
        it('should send POST request to save retrospective', () => {
            service.saveRetrospective(mockRetrospective).subscribe(result => {
                expect(result).toEqual(mockRetrospective);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1/retrospective');
            expect(req.request.method).toBe('POST');
            req.flush(mockRetrospective);
        });
    });

    describe('getBurndownData', () => {
        it('should fetch burndown chart data', () => {
            const burndownData = { dates: ['2026-01-01'], remaining: [20] };

            service.getBurndownData(1).subscribe(result => {
                expect(result).toEqual(burndownData);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/sprints/1/burndown');
            expect(req.request.method).toBe('GET');
            req.flush(burndownData);
        });
    });

    describe('utility methods', () => {
        it('should calculate days remaining correctly', () => {
            const sprint = {
                ...mockSprint,
                endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
            };
            const days = service.getDaysRemaining(sprint);
            expect(days).toBeGreaterThanOrEqual(4);
            expect(days).toBeLessThanOrEqual(6);
        });

        it('should return 0 for past end dates', () => {
            const sprint = {
                ...mockSprint,
                endDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // yesterday
            };
            expect(service.getDaysRemaining(sprint)).toBe(0);
        });

        it('should calculate progress percentage correctly', () => {
            expect(service.getProgressPercentage(mockSprint)).toBe(50);
        });

        it('should return 0 when total points is 0', () => {
            const sprint = { ...mockSprint, totalPoints: 0, completedPoints: 0 };
            expect(service.getProgressPercentage(sprint)).toBe(0);
        });

        it('should return correct status colors', () => {
            expect(service.getStatusColor(SprintStatus.ACTIVE)).toBe('primary');
            expect(service.getStatusColor(SprintStatus.COMPLETED)).toBe('accent');
            expect(service.getStatusColor(SprintStatus.PLANNED)).toBe('warn');
        });
    });
});
