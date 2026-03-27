import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

// Components
import { StudentInvitationsComponent } from './invitations/student-invitations.component';
import { StudentProfileComponent } from './profile/student-profile.component';
import { StudentNotificationsComponent } from './notifications/student-notifications.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
    {
        path: 'teams',
        loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    },
    {
        path: 'mentors',
        loadChildren: () => import('../mentors/mentors.module').then(m => m.MentorsModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    },
    {
        path: 'tasks',
        loadChildren: () => import('../tasks/tasks.module').then(m => m.TasksModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    },
    { path: 'invitations', component: StudentInvitationsComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
    { path: 'profile', component: StudentProfileComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
    { path: 'notifications', component: StudentNotificationsComponent, canActivate: [AuthGuard], data: { role: 'STUDENT' } },
    {
        path: 'meetings',
        loadChildren: () => import('../meetings/meetings.module').then(m => m.MeetingsModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    },
    {
        path: 'showcase',
        loadChildren: () => import('../showcase/showcase.module').then(m => m.ShowcaseModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    },
    {
        path: 'buckets',
        loadChildren: () => import('../buckets/buckets.module').then(m => m.BucketsModule),
        canActivate: [AuthGuard],
        data: { role: 'STUDENT' }
    }
];

@NgModule({
    declarations: [
        StudentInvitationsComponent,
        StudentProfileComponent,
        StudentNotificationsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatButtonToggleModule
    ]
})
export class StudentPagesModule { }
