import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Components
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { BucketManagementComponent } from './bucket-management/bucket-management.component';
import { MentorAssignmentComponent } from './mentor-assignment/mentor-assignment.component';
import { ProjectManagementComponent } from './project-management/project-management.component';
import { TeamManagementComponent } from './team-management/team-management.component';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,
        canActivate: [AuthGuard],
        data: { role: 'ADMIN' },
        children: [
            { path: 'dashboard', component: AdminDashboardComponent },
            { path: 'users', component: UserManagementComponent },
            { path: 'projects', component: ProjectManagementComponent },
            { path: 'teams', component: TeamManagementComponent },
            { path: 'buckets', component: BucketManagementComponent },
            { path: 'mentor-assignment', component: MentorAssignmentComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    declarations: [
        AdminLayoutComponent,
        AdminDashboardComponent,
        UserManagementComponent,
        BucketManagementComponent,
        MentorAssignmentComponent,
        ProjectManagementComponent,
        TeamManagementComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatFormFieldModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatDividerModule,
        MatInputModule,
        MatMenuModule,
        MatBadgeModule
    ]
})
export class AdminModule { }
