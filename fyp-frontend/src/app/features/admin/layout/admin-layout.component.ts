import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;
    currentUser: User | null = null;
    sidenavOpened = true;
    isMobile = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private breakpointObserver: BreakpointObserver
    ) {
        this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
            this.isMobile = result.matches;
            this.sidenavOpened = !this.isMobile;
        });
    }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
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
        this.router.navigate([`/admin/${route}`]);
    }
}
