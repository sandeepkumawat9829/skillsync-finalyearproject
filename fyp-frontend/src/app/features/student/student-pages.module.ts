import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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


@NgModule({
    declarations: [
        StudentInvitationsComponent,
        StudentProfileComponent,
        StudentNotificationsComponent
    ],
    exports: [
        StudentInvitationsComponent,
        StudentProfileComponent,
        StudentNotificationsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
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
