import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification } from '../../../core/models/notification.model';

@Component({
    selector: 'app-mentor-notifications',
    templateUrl: './mentor-notifications.component.html',
    styleUrls: ['./mentor-notifications.component.scss']
})
export class MentorNotificationsComponent implements OnInit {
    notifications: Notification[] = [];
    filteredNotifications: Notification[] = [];
    loading = true;

    selectedFilter = 'ALL';

    constructor(
        private notificationService: NotificationService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadNotifications();
    }

    loadNotifications(): void {
        this.loading = true;
        this.notificationService.getMyNotifications().subscribe({
            next: (data) => {
                this.notifications = data.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                this.applyFilter();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading notifications', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        if (this.selectedFilter === 'ALL') {
            this.filteredNotifications = this.notifications;
        } else if (this.selectedFilter === 'UNREAD') {
            this.filteredNotifications = this.notifications.filter(n => !n.isRead);
        } else {
            this.filteredNotifications = this.notifications.filter(n => n.isRead);
        }
    }

    markAsRead(notification: Notification): void {
        if (notification.isRead) return;

        this.notificationService.markAsRead(notification.notificationId).subscribe({
            next: () => {
                notification.isRead = true;
                this.applyFilter();
            }
        });
    }

    markAllAsRead(): void {
        this.notificationService.markAllAsRead().subscribe({
            next: () => {
                this.notifications.forEach(n => n.isRead = true);
                this.snackBar.open('All notifications marked as read', 'Close', { duration: 2000 });
                this.applyFilter();
            }
        });
    }

    deleteNotification(notification: Notification, event: Event): void {
        event.stopPropagation();

        this.notificationService.deleteNotification(notification.notificationId).subscribe({
            next: () => {
                this.notifications = this.notifications.filter(n => n.notificationId !== notification.notificationId);
                this.snackBar.open('Notification deleted', 'Close', { duration: 2000 });
                this.applyFilter();
            }
        });
    }

    handleNotificationClick(notification: Notification): void {
        this.markAsRead(notification);
        if (notification.actionUrl) {
            this.router.navigate([notification.actionUrl]);
        }
    }

    getNotificationIcon(type: string): string {
        const icons: any = {
            'TEAM_INVITE': 'group_add',
            'TASK_ASSIGNED': 'assignment',
            'MENTOR_RESPONSE': 'school',
            'PROJECT_UPDATE': 'folder',
            'SYSTEM': 'info'
        };
        return icons[type] || 'notifications';
    }

    getNotificationColor(type: string): string {
        const colors: any = {
            'TEAM_INVITE': 'team',
            'TASK_ASSIGNED': 'task',
            'MENTOR_RESPONSE': 'mentor',
            'PROJECT_UPDATE': 'project',
            'SYSTEM': 'system'
        };
        return colors[type] || '';
    }

    getTimeAgo(date: Date): string {
        const now = new Date().getTime();
        const notifTime = new Date(date).getTime();
        const diff = now - notifTime;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    get hasUnread(): boolean {
        return this.notifications.some(n => !n.isRead);
    }

    get unreadCount(): number {
        return this.notifications.filter(n => !n.isRead).length;
    }
}
