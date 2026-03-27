import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { Notification } from '../models/notification.model';

describe('NotificationService', () => {
    let service: NotificationService;
    let httpMock: HttpTestingController;

    const mockNotification: Notification = {
        notificationId: 1,
        userId: 1,
        title: 'New Invitation',
        message: 'You have been invited to join Team Alpha',
        type: 'TEAM_INVITE',
        isRead: false,
        createdAt: new Date()
    };

    const mockNotifications: Notification[] = [
        mockNotification,
        { ...mockNotification, notificationId: 2, isRead: true }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NotificationService]
        });
        service = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getMyNotifications', () => {
        it('should fetch user notifications', () => {
            service.getMyNotifications().subscribe(notifications => {
                expect(notifications.length).toBe(2);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications');
            expect(req.request.method).toBe('GET');
            req.flush(mockNotifications);
        });

        it('should update unread count when fetching notifications', () => {
            service.getMyNotifications().subscribe(() => {
                service.unreadCount$.subscribe(count => {
                    expect(count).toBe(1); // Only one notification is unread
                });
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications');
            req.flush(mockNotifications);
        });
    });

    describe('markAsRead', () => {
        it('should send PUT request to mark notification as read', () => {
            service.markAsRead(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/1/read');
            expect(req.request.method).toBe('PUT');
            req.flush(null);
        });

        it('should decrement unread count', () => {
            // First set the count
            service.getMyNotifications().subscribe();
            const getReq = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications');
            getReq.flush(mockNotifications);

            // Then mark as read
            service.markAsRead(1).subscribe(() => {
                service.unreadCount$.subscribe(count => {
                    expect(count).toBe(0);
                });
            });

            const markReq = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/1/read');
            markReq.flush(null);
        });
    });

    describe('markAllAsRead', () => {
        it('should send PUT request to mark all as read', () => {
            service.markAllAsRead().subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/read-all');
            expect(req.request.method).toBe('PUT');
            req.flush(null);
        });

        it('should set unread count to 0', () => {
            service.markAllAsRead().subscribe(() => {
                service.unreadCount$.subscribe(count => {
                    expect(count).toBe(0);
                });
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/read-all');
            req.flush(null);
        });
    });

    describe('deleteNotification', () => {
        it('should send DELETE request', () => {
            service.deleteNotification(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('refreshUnreadCount', () => {
        it('should fetch and update unread count', () => {
            service.refreshUnreadCount();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/notifications/unread-count');
            expect(req.request.method).toBe('GET');
            req.flush(5);

            service.unreadCount$.subscribe(count => {
                expect(count).toBe(5);
            });
        });
    });

    describe('unreadCount$', () => {
        it('should start with 0', () => {
            service.unreadCount$.subscribe(count => {
                expect(count).toBe(0);
            });
        });
    });
});
