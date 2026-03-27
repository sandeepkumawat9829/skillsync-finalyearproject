import { of } from 'rxjs';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';
import { AnalyticsService } from '../../core/services/analytics.service';

describe('AnalyticsDashboardComponent', () => {
    let component: AnalyticsDashboardComponent;
    let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

    const mockAnalytics = {
        projectCount: 10,
        teamCount: 5,
        completedTasks: 50,
        pendingTasks: 25,
        averageProgress: 65
    };

    beforeEach(() => {
        analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', [
            'getProjectAnalytics', 'getTeamAnalytics', 'getUserAnalytics'
        ]);
        analyticsServiceSpy.getProjectAnalytics.and.returnValue(of(mockAnalytics));
        analyticsServiceSpy.getTeamAnalytics.and.returnValue(of(mockAnalytics));
        analyticsServiceSpy.getUserAnalytics.and.returnValue(of(mockAnalytics));

        component = new AnalyticsDashboardComponent(analyticsServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load analytics on init', () => {
            component.ngOnInit();
            expect(analyticsServiceSpy.getProjectAnalytics).toHaveBeenCalled();
        });
    });

    describe('Data Display', () => {
        it('should have analytics data after load', () => {
            component.ngOnInit();
            expect(component.analytics).toBeTruthy();
        });
    });
});
