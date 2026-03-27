import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDashboardComponent } from './student-dashboard.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { TeamService } from '../../../core/services/team.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';
import { User } from '../../../core/models/user.model';

describe('StudentDashboardComponent', () => {
    let component: StudentDashboardComponent;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let taskServiceSpy: jasmine.SpyObj<TaskService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockUser: User = {
        userId: 1,
        email: 'student@example.com',
        role: 'STUDENT'
    };

    const mockProjects = [
        {
            projectId: 1, title: 'Test Project', abstractText: '', fullDescription: '',
            technologies: ['Angular'], domain: 'Web', createdBy: 1, status: 'IN_PROGRESS' as const,
            visibility: 'PUBLIC' as const, createdAt: new Date(), updatedAt: new Date()
        }
    ];

    const mockNotifications = [
        {
            notificationId: 1, userId: 1, type: 'TEAM_INVITE' as const,
            title: 'Team Invite', message: 'You have a team invite',
            isRead: false, createdAt: new Date()
        }
    ];

    const mockTasks = [
        {
            taskId: 1, projectId: 1, title: 'Task 1', description: 'Test',
            status: 'TODO' as const, priority: 'MEDIUM' as const,
            createdBy: 1, createdByName: 'User', createdAt: new Date(), updatedAt: new Date()
        }
    ];

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
            currentUserValue: mockUser
        });
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getMyProjects']);
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['getMyTeam', 'getMyInvitations']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['getMyNotifications']);
        taskServiceSpy = jasmine.createSpyObj('TaskService', ['getMyTasks']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        projectServiceSpy.getMyProjects.and.returnValue(of(mockProjects));
        teamServiceSpy.getMyTeam.and.returnValue(of({ teamId: 1, teamName: 'Test Team', projectId: 1, teamLeaderId: 1, members: [], currentMemberCount: 1, maxMembers: 4, isComplete: false, status: 'FORMING' as const, createdAt: new Date() }));
        teamServiceSpy.getMyInvitations.and.returnValue(of([]));
        notificationServiceSpy.getMyNotifications.and.returnValue(of(mockNotifications));
        taskServiceSpy.getMyTasks.and.returnValue(of(mockTasks));

        component = new StudentDashboardComponent(
            authServiceSpy, projectServiceSpy, teamServiceSpy,
            notificationServiceSpy, taskServiceSpy, routerSpy
        );
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load current user on init', () => {
            expect(component.currentUser).toEqual(mockUser);
        });

        it('should initialize with sidenav opened', () => {
            expect(component.sidenavOpened).toBeTrue();
        });

        it('should load projects from API', () => {
            expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
            expect(component.myProjects.length).toBe(1);
            expect(component.stats.projects).toBe(1);
        });

        it('should load notifications from API', () => {
            expect(notificationServiceSpy.getMyNotifications).toHaveBeenCalled();
            expect(component.notifications.length).toBe(1);
            expect(component.unreadCount).toBe(1);
        });

        it('should load tasks from API', () => {
            expect(taskServiceSpy.getMyTasks).toHaveBeenCalled();
            expect(component.stats.tasksDue).toBe(1);
        });

        it('should load team from API', () => {
            expect(teamServiceSpy.getMyTeam).toHaveBeenCalled();
            expect(component.stats.teams).toBe(1);
        });
    });

    describe('Logout', () => {
        it('should call AuthService.logout', () => {
            component.logout();
            expect(authServiceSpy.logout).toHaveBeenCalled();
        });

        it('should navigate to login page', () => {
            component.logout();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        });
    });

    describe('Sidenav Toggle', () => {
        it('should toggle sidenav state', () => {
            expect(component.sidenavOpened).toBeTrue();
            component.toggleSidenav();
            expect(component.sidenavOpened).toBeFalse();
            component.toggleSidenav();
            expect(component.sidenavOpened).toBeTrue();
        });
    });

    describe('Navigation', () => {
        it('should navigate to student/projects', () => {
            component.navigateTo('projects');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects']);
        });

        it('should navigate to student/teams', () => {
            component.navigateTo('teams');
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams']);
        });
    });

    describe('Notification Icons', () => {
        it('should return correct icon for TEAM_INVITE', () => {
            expect(component.getNotificationIcon('TEAM_INVITE')).toBe('group_add');
        });

        it('should return correct icon for TASK_ASSIGNED', () => {
            expect(component.getNotificationIcon('TASK_ASSIGNED')).toBe('assignment');
        });

        it('should return fallback icon for unknown type', () => {
            expect(component.getNotificationIcon('UNKNOWN')).toBe('notifications');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', () => {
            projectServiceSpy.getMyProjects.and.returnValue(throwError(() => new Error('API Error')));
            teamServiceSpy.getMyInvitations.and.returnValue(throwError(() => new Error('API Error')));
            notificationServiceSpy.getMyNotifications.and.returnValue(throwError(() => new Error('API Error')));
            taskServiceSpy.getMyTasks.and.returnValue(throwError(() => new Error('API Error')));
            teamServiceSpy.getMyTeam.and.returnValue(throwError(() => new Error('API Error')));

            component.loadDashboardData();

            expect(component.myProjects.length).toBe(0);
            expect(component.stats.projects).toBe(0);
            expect(component.stats.teams).toBe(0);
        });
    });
});
