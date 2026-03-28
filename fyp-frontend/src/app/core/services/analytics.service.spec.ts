import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalyticsService, ProjectAnalytics } from './analytics.service';
import { BurndownData, VelocityData, ContributionData, AnalyticsOverview } from '../models/analytics.model';

describe('AnalyticsService', () => {
    let service: AnalyticsService;
    let httpMock: HttpTestingController;

    const mockBurndownData: BurndownData[] = [
        { date: new Date(), idealRemaining: 20, actualRemaining: 18 }
    ];

    const mockVelocityData: VelocityData[] = [
        { sprintName: 'Sprint 1', completedPoints: 18, committedPoints: 20, completionPercentage: 90 }
    ];

    const mockContributionData: ContributionData[] = [
        { memberName: 'John', tasksCompleted: 5, percentage: 50, color: '#4285f4' }
    ];

    const mockOverview: AnalyticsOverview = {
        currentVelocity: 18,
        sprintProgress: 60,
        completionRate: 85,
        totalTasksCompleted: 30,
        averageVelocity: 17,
        teamEfficiency: 'high'
    };

    const mockAnalytics: ProjectAnalytics = {
        burndownData: mockBurndownData,
        velocityData: mockVelocityData,
        contributionData: mockContributionData,
        overview: mockOverview
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AnalyticsService]
        });
        service = TestBed.inject(AnalyticsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getProjectAnalytics', () => {
        it('should fetch complete project analytics', () => {
            service.getProjectAnalytics(1).subscribe(analytics => {
                expect(analytics).toEqual(mockAnalytics);
            });

            const req = httpMock.expectOne('/api/analytics/project/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockAnalytics);
        });
    });

    describe('getBurndownData', () => {
        it('should fetch burndown data for sprint', () => {
            service.getBurndownData(1, 5).subscribe(data => {
                expect(data.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/analytics/project/1/burndown?sprintId=5');
            expect(req.request.method).toBe('GET');
            req.flush(mockBurndownData);
        });
    });

    describe('getVelocityData', () => {
        it('should fetch velocity data', () => {
            service.getVelocityData(1).subscribe(data => {
                expect(data.length).toBe(1);
                expect(data[0].completedPoints).toBe(18);
            });

            const req = httpMock.expectOne('/api/analytics/project/1/velocity');
            expect(req.request.method).toBe('GET');
            req.flush(mockVelocityData);
        });
    });

    describe('getContributionData', () => {
        it('should fetch contribution data', () => {
            service.getContributionData(1).subscribe(data => {
                expect(data.length).toBe(1);
                expect(data[0].memberName).toBe('John');
            });

            const req = httpMock.expectOne('/api/analytics/project/1/contributions');
            expect(req.request.method).toBe('GET');
            req.flush(mockContributionData);
        });
    });

    describe('getSprintMetrics', () => {
        it('should fetch sprint metrics', () => {
            service.getSprintMetrics(1).subscribe();

            const req = httpMock.expectOne('/api/analytics/project/1/sprint-metrics');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });

    describe('getAnalyticsOverview', () => {
        it('should fetch analytics overview', () => {
            service.getAnalyticsOverview(1).subscribe(overview => {
                expect(overview.completionRate).toBe(85);
                expect(overview.teamEfficiency).toBe('high');
            });

            const req = httpMock.expectOne('/api/analytics/project/1/overview');
            expect(req.request.method).toBe('GET');
            req.flush(mockOverview);
        });
    });

    describe('getTimeBasedMetrics', () => {
        it('should fetch time-based metrics with default days', () => {
            service.getTimeBasedMetrics(1).subscribe();

            const req = httpMock.expectOne('/api/analytics/project/1/time-metrics?days=30');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });

        it('should fetch time-based metrics with custom days', () => {
            service.getTimeBasedMetrics(1, 60).subscribe();

            const req = httpMock.expectOne('/api/analytics/project/1/time-metrics?days=60');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });
});
