import { of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../../core/services/admin.service';
import { SystemAnalytics } from '../../../core/models/admin.model';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;

    const mockAnalytics: SystemAnalytics = {
        totalStudents: 100,
        totalMentors: 20,
        totalProjects: 50,
        totalTeams: 30,
        activeProjects: 45,
        pendingMentorRequests: 5,
        registrationTrend: [{ date: '2026-01-01', count: 10 }],
        projectCreationTrend: [{ date: '2026-01-01', count: 5 }],
        projectsByDomain: { AI_ML: 20, WEB_APP: 30 },
        projectsByStatus: { APPROVED: 40, IN_PROGRESS: 10 }
    };

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', ['getSystemAnalytics']);
        adminServiceSpy.getSystemAnalytics.and.returnValue(of(mockAnalytics));

        component = new AdminDashboardComponent(adminServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load analytics on init', () => {
            component.ngOnInit();
            expect(adminServiceSpy.getSystemAnalytics).toHaveBeenCalled();
        });

        it('should set analytics after loading', () => {
            component.ngOnInit();
            expect(component.analytics).toEqual(mockAnalytics);
        });

        it('should set loading to false after success', () => {
            component.ngOnInit();
            expect(component.loading).toBeFalse();
        });
    });

    describe('Load Analytics', () => {
        it('should set loading to true during load', () => {
            component.loadAnalytics();
            // After observable completes, loading is false
            expect(component.loading).toBeFalse();
        });

        it('should handle error gracefully', () => {
            adminServiceSpy.getSystemAnalytics.and.returnValue(throwError(() => new Error('Error')));
            component.loadAnalytics();
            expect(component.loading).toBeFalse();
        });
    });

    describe('Cleanup', () => {
        it('should not throw on ngOnDestroy', () => {
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });
});
