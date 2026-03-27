import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private apiUrl = 'https://outermost-leisha-noncoherently.ngrok-free.de/api/notifications';

    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    constructor(private http: HttpClient) { }

    // Get all notifications for current user
    getMyNotifications(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.apiUrl}`).pipe(
            tap(notifications => {
                const unreadCount = notifications.filter(n => !n.isRead).length;
                this.unreadCountSubject.next(unreadCount);
            })
        );
    }

    // Mark notification as read
    markAsRead(notificationId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
            tap(() => {
                const currentCount = this.unreadCountSubject.value;
                if (currentCount > 0) {
                    this.unreadCountSubject.next(currentCount - 1);
                }
            })
        );
    }

    // Mark all as read
    markAllAsRead(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
            tap(() => this.unreadCountSubject.next(0))
        );
    }

    // Delete notification
    deleteNotification(notificationId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
    }

    // Refresh unread count
    refreshUnreadCount(): void {
        this.http.get<{ count: number }>(`${this.apiUrl}/count`).subscribe(response => {
            this.unreadCountSubject.next(response.count);
        });
    }
}
