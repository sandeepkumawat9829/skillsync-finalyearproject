import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MentorService } from '../../../core/services/mentor.service';
import { User } from '../../../core/models/user.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-mentor-layout',
    templateUrl: './mentor-layout.component.html',
    styleUrls: ['./mentor-layout.component.scss']
})
export class MentorLayoutComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    currentUser: User | null = null;
    sidenavOpened = true;
    isMobile = false;
    unreadCount = 0;
    pendingRequests = 0;

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService,
        private mentorService: MentorService,
        private router: Router,
        private breakpointObserver: BreakpointObserver,
        private snackBar: MatSnackBar
    ) {
        this.breakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
            this.isMobile = result.matches;
            this.sidenavOpened = !this.isMobile;
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.loadNotificationCount();
        this.loadPendingRequests();
    }

    loadNotificationCount(): void {
        this.notificationService.getMyNotifications().pipe(
            catchError(() => of([]))
        ).subscribe((notifications: any[]) => {
            this.unreadCount = notifications.filter(n => !n.isRead).length;
        });
    }

    loadPendingRequests(): void {
        this.mentorService.getAllMentorRequests().pipe(
            catchError(() => of([]))
        ).subscribe((requests: any[]) => {
            this.pendingRequests = requests.filter(r => r.status === 'PENDING').length;
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    toggleSidenav(): void {
        this.sidenavOpened = !this.sidenavOpened;
    }

    navigateTo(route: string): void {
        if (this.isMobile && this.sidenav) {
            this.sidenav.close();
            this.sidenavOpened = false;
        }
        this.router.navigate([`/mentor/${route}`]);
    }
}
