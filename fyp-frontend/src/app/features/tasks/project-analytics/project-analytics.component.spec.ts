import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ProjectAnalyticsComponent } from './project-analytics.component';
import { AnalyticsService } from '../../../core/services/analytics.service';

describe('ProjectAnalyticsComponent', () => {
    let component: ProjectAnalyticsComponent;
    let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

    const mockAnalytics = {
        totalTasks: 50,
        completedTasks: 30,
        inProgressTasks: 15,
        pendingTasks: 5,
        averageCompletionTime: 3.5,
        tasksByPriority: { HIGH: 10, MEDIUM: 25, LOW: 15 }
    };

    beforeEach(() => {
        analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['getProjectAnalytics']);
        analyticsServiceSpy.getProjectAnalytics.and.returnValue(of(mockAnalytics));

        const mockActivatedRoute = {
            queryParams: of({ projectId: 1 })
        } as any;

        component = new ProjectAnalyticsComponent(mockActivatedRoute, analyticsServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load analytics on init', () => {
            component.ngOnInit();
            expect(analyticsServiceSpy.getProjectAnalytics).toHaveBeenCalled();
        });

        it('should set analytics data', () => {
            component.ngOnInit();
            expect(component.analytics).toBeTruthy();
        });
    });

    describe('getCompletionPercentage', () => {
        it('should calculate completion percentage', () => {
            component.analytics = mockAnalytics;
            expect(component.getCompletionPercentage()).toBe(60);
        });
    });
});
