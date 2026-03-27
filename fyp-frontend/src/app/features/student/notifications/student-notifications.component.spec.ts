import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentNotificationsComponent } from './student-notifications.component';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

describe('StudentNotificationsComponent', () => {
    let component: StudentNotificationsComponent;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockNotifications: Notification[] = [
        {
            notificationId: 1,
            userId: 1,
            type: 'TEAM_INVITE',
            title: 'New Invitation',
            message: 'You have a new team invitation',
            isRead: false,
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
            'getMyNotifications', 'markAsRead', 'markAllAsRead', 'deleteNotification'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        notificationServiceSpy.getMyNotifications.and.returnValue(of(mockNotifications));
        notificationServiceSpy.markAsRead.and.returnValue(of(void 0));
        notificationServiceSpy.markAllAsRead.and.returnValue(of(void 0));
        notificationServiceSpy.deleteNotification.and.returnValue(of(void 0));

        component = new StudentNotificationsComponent(notificationServiceSpy, routerSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load notifications on init', () => {
            component.ngOnInit();
            expect(notificationServiceSpy.getMyNotifications).toHaveBeenCalled();
        });
    });

    describe('markAllAsRead', () => {
        it('should call markAllAsRead service', () => {
            component.markAllAsRead();
            expect(notificationServiceSpy.markAllAsRead).toHaveBeenCalled();
        });
    });

    describe('getNotificationIcon', () => {
        it('should return group_add icon for TEAM_INVITE', () => {
            expect(component.getNotificationIcon('TEAM_INVITE')).toBe('group_add');
        });

        it('should return assignment icon for TASK_ASSIGNED', () => {
            expect(component.getNotificationIcon('TASK_ASSIGNED')).toBe('assignment');
        });
    });

    describe('getNotificationColor', () => {
        it('should return team for TEAM_INVITE', () => {
            expect(component.getNotificationColor('TEAM_INVITE')).toBe('team');
        });
    });

    describe('getTimeAgo', () => {
        it('should return time ago string', () => {
            const result = component.getTimeAgo(new Date());
            expect(result).toContain('m ago');
        });
    });
});
