import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MentorDashboardComponent } from './mentor-dashboard.component';
import { MentorService } from '../../../core/services/mentor.service';
import { AuthService } from '../../../core/services/auth.service';

describe('MentorDashboardComponent', () => {
    let component: MentorDashboardComponent;
    let mentorServiceSpy: jasmine.SpyObj<MentorService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        mentorServiceSpy = jasmine.createSpyObj('MentorService', [
            'getAllMentorRequests',
            'getMyAssignments',
            'getMentorProfile'
        ]);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
            currentUserValue: { userId: 5, email: 'mentor@example.com', role: 'MENTOR' }
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        mentorServiceSpy.getAllMentorRequests.and.returnValue(of([]));
        mentorServiceSpy.getMyAssignments.and.returnValue(of([]));
        mentorServiceSpy.getMentorProfile.and.returnValue(of({ fullName: 'Dr. Smith' }));

        component = new MentorDashboardComponent(
            mentorServiceSpy,
            authServiceSpy,
            routerSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load dashboard data on init', () => {
        component.ngOnInit();

        expect(mentorServiceSpy.getAllMentorRequests).toHaveBeenCalled();
        expect(mentorServiceSpy.getMyAssignments).toHaveBeenCalled();
        expect(mentorServiceSpy.getMentorProfile).toHaveBeenCalledWith(5);
    });

    it('should navigate to mentor requests', () => {
        component.navigateTo('requests');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/mentor/requests']);
    });

    it('should navigate to team page', () => {
        component.viewTeam(11);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams', 11]);
    });

    it('should navigate to kanban board for assigned team', () => {
        component.openKanban({
            assignmentId: 1,
            teamId: 11,
            teamName: 'Alpha',
            projectId: 9,
            projectTitle: 'Mentor Project',
            projectStatus: 'IN_PROGRESS',
            memberCount: 4,
            progress: 45,
            assignedAt: new Date(),
            status: 'ACTIVE'
        });

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/tasks/board'], {
            queryParams: { projectId: 9 }
        });
    });

    it('should logout and navigate to login', () => {
        component.logout();
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
});
