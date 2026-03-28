import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StudentLayoutComponent } from './layout/student-layout.component';
import { StudentDashboardComponent } from './dashboard/student-dashboard.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { StudentPagesModule } from './student-pages.module';
import { StudentInvitationsComponent } from './invitations/student-invitations.component';
import { StudentProfileComponent } from './profile/student-profile.component';
import { StudentNotificationsComponent } from './notifications/student-notifications.component';

const routes: Routes = [
    {
        path: '',
        component: StudentLayoutComponent,
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' },
        children: [
            {
                path: 'dashboard',
                component: StudentDashboardComponent
            },
            {
                path: 'projects',
                loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule)
            },
            {
                path: 'sprints',
                loadChildren: () => import('../sprints/sprints.module').then(m => m.SprintsModule)
            },
            {
                path: 'time',
                loadChildren: () => import('../time-tracking/time-tracking.module').then(m => m.TimeTrackingModule)
            },
            {
                path: 'chat',
                loadChildren: () => import('../chat/chat.module').then(m => m.ChatModule)
            },
            {
                path: 'teams',
                loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule)
            },
            {
                path: 'mentors',
                loadChildren: () => import('../mentors/mentors.module').then(m => m.MentorsModule)
            },
            {
                path: 'tasks',
                loadChildren: () => import('../tasks/tasks.module').then(m => m.TasksModule)
            },
            {
                path: 'invitations',
                component: StudentInvitationsComponent
            },
            {
                path: 'meetings',
                loadChildren: () => import('../meetings/meetings.module').then(m => m.MeetingsModule)
            },
            {
                path: 'showcase',
                loadChildren: () => import('../showcase/showcase.module').then(m => m.ShowcaseModule)
            },
            {
                path: 'buckets',
                loadChildren: () => import('../buckets/buckets.module').then(m => m.BucketsModule)
            },
            {
                path: 'profile',
                component: StudentProfileComponent
            },
            {
                path: 'notifications',
                component: StudentNotificationsComponent
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    declarations: [
        StudentLayoutComponent,
        StudentDashboardComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
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
        MatTabsModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        StudentPagesModule
    ]
})
export class StudentModule { }
