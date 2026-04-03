import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Components
import { SprintListComponent } from './sprint-list/sprint-list.component';
import { CreateSprintDialogComponent } from './create-sprint-dialog/create-sprint-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

// Guards
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        component: SprintListComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    declarations: [
        SprintListComponent,
        CreateSprintDialogComponent,
        ConfirmDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        // Material
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatTabsModule,
        MatSnackBarModule,
        MatTooltipModule
    ]
})
export class SprintsModule { }
