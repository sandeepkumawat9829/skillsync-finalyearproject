import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Components
import { MentorDashboardComponent } from './dashboard/mentor-dashboard.component';
import { MentorRequestsComponent, AcceptDialogComponent, RejectDialogComponent } from './requests/mentor-requests.component';
import { MentorTeamsComponent } from './teams/mentor-teams.component';
import { MentorLayoutComponent } from './layout/mentor-layout.component';
import { MentorNotificationsComponent } from './notifications/mentor-notifications.component';
import { MentorOwnProfileComponent } from './profile/mentor-own-profile.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: MentorLayoutComponent,
        canActivate: [AuthGuard],
        data: { role: 'MENTOR' },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                component: MentorDashboardComponent
            },
            {
                path: 'requests',
                component: MentorRequestsComponent
            },
            {
                path: 'teams',
                component: MentorTeamsComponent
            },
            {
                path: 'projects',
                loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: 'task-workspace',
                loadChildren: () => import('../tasks/tasks.module').then(m => m.TasksModule)
            },
            {
                path: 'team-workspace',
                loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule)
            },
            {
                path: 'meetings',
                loadChildren: () => import('../meetings/meetings.module').then(m => m.MeetingsModule)
            },
            {
                path: 'notifications',
                component: MentorNotificationsComponent
            },
            {
                path: 'profile',
                component: MentorOwnProfileComponent
            }
        ]
    }
];

@NgModule({
    declarations: [
        MentorLayoutComponent,
        MentorDashboardComponent,
        MentorRequestsComponent,
        MentorTeamsComponent,
        AcceptDialogComponent,
        RejectDialogComponent,
        MentorNotificationsComponent,
        MentorOwnProfileComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DatePipe,
        RouterModule.forChild(routes),
        // Material
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatBadgeModule,
        MatChipsModule,
        MatMenuModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatSnackBarModule,
        MatButtonToggleModule
    ]
})
export class MentorModule { }
