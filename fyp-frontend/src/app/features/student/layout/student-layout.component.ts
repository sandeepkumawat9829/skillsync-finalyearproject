import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TeamService } from '../../../core/services/team.service';
import { User } from '../../../core/models/user.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-student-layout',
    templateUrl: './student-layout.component.html',
    styleUrls: ['./student-layout.component.scss']
})
export class StudentLayoutComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    currentUser: User | null = null;
    sidenavOpened = true;
    isMobile = false;
    unreadCount = 0;
    pendingInvites = 0;

    constructor(
        private authService: AuthService,
        private notificationService: NotificationService,
        private teamService: TeamService,
        private router: Router,
        private breakpointObserver: BreakpointObserver
    ) {
        this.breakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
            this.isMobile = result.matches;
            this.sidenavOpened = !this.isMobile;
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.loadNotificationCount();
        this.loadInviteCount();
    }

    loadNotificationCount(): void {
        this.notificationService.getMyNotifications().pipe(
            catchError(() => of([]))
        ).subscribe(notifications => {
            this.unreadCount = notifications.filter(n => !n.isRead).length;
        });
    }

    loadInviteCount(): void {
        this.teamService.getMyInvitations().pipe(
            catchError(() => of([]))
        ).subscribe(invitations => {
            this.pendingInvites = invitations.filter(inv => inv.status === 'PENDING').length;
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
        this.router.navigate([`/student/${route}`]);
    }
}
