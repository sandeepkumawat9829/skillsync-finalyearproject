import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MilestoneService, Milestone } from './milestone.service';

describe('MilestoneService', () => {
    let service: MilestoneService;
    let httpMock: HttpTestingController;

    const mockMilestone: Milestone = {
        milestoneId: 1,
        projectId: 1,
        projectTitle: 'Test Project',
        milestoneName: 'Phase 1',
        description: 'Initial phase',
        dueDate: new Date().toISOString(),
        status: 'IN_PROGRESS',
        completionPercentage: 50,
        reviewedByMentor: false,
        createdAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MilestoneService]
        });
        service = TestBed.inject(MilestoneService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getProjectMilestones', () => {
        it('should fetch milestones by project ID', () => {
            service.getProjectMilestones(1).subscribe(milestones => {
                expect(milestones.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/milestones/project/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockMilestone]);
        });
    });

    describe('getMilestone', () => {
        it('should fetch single milestone by ID', () => {
            service.getMilestone(1).subscribe(milestone => {
                expect(milestone).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockMilestone);
        });
    });

    describe('createMilestone', () => {
        it('should send POST request to create milestone', () => {
            service.createMilestone(mockMilestone).subscribe(result => {
                expect(result).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones');
            expect(req.request.method).toBe('POST');
            req.flush(mockMilestone);
        });
    });

    describe('updateMilestone', () => {
        it('should send PUT request to update milestone', () => {
            service.updateMilestone(1, mockMilestone).subscribe(result => {
                expect(result).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockMilestone);
        });
    });

    describe('updateStatus', () => {
        it('should send POST request to update status', () => {
            service.updateStatus(1, 'COMPLETED').subscribe(result => {
                expect(result).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones/1/status');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ status: 'COMPLETED' });
            req.flush(mockMilestone);
        });
    });

    describe('completeMilestone', () => {
        it('should send POST request to complete milestone', () => {
            service.completeMilestone(1).subscribe(result => {
                expect(result).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones/1/complete');
            expect(req.request.method).toBe('POST');
            req.flush(mockMilestone);
        });
    });

    describe('addMentorReview', () => {
        it('should send POST request to add mentor review', () => {
            service.addMentorReview(1, 'Great progress!').subscribe(result => {
                expect(result).toEqual(mockMilestone);
            });

            const req = httpMock.expectOne('/api/milestones/1/review');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ feedback: 'Great progress!' });
            req.flush(mockMilestone);
        });
    });

    describe('getOverdueMilestones', () => {
        it('should fetch overdue milestones', () => {
            service.getOverdueMilestones(1).subscribe();

            const req = httpMock.expectOne('/api/milestones/project/1/overdue');
            expect(req.request.method).toBe('GET');
            req.flush([mockMilestone]);
        });
    });

    describe('getPendingReviews', () => {
        it('should fetch pending review milestones', () => {
            service.getPendingReviews(1).subscribe();

            const req = httpMock.expectOne('/api/milestones/project/1/pending-reviews');
            expect(req.request.method).toBe('GET');
            req.flush([mockMilestone]);
        });
    });

    describe('getProjectProgress', () => {
        it('should fetch project progress', () => {
            service.getProjectProgress(1).subscribe(result => {
                expect(result.progress).toBe(75);
            });

            const req = httpMock.expectOne('/api/milestones/project/1/progress');
            expect(req.request.method).toBe('GET');
            req.flush({ progress: 75 });
        });
    });

    describe('deleteMilestone', () => {
        it('should send DELETE request', () => {
            service.deleteMilestone(1).subscribe();

            const req = httpMock.expectOne('/api/milestones/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
