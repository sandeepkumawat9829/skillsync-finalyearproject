import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

// Components
import { MeetingListComponent } from './meeting-list/meeting-list.component';
import { MeetingCreateComponent } from './meeting-create/meeting-create.component';
import { MeetingDetailComponent } from './meeting-detail/meeting-detail.component';

const routes: Routes = [
    {
        path: '',
        component: MeetingListComponent
    },
    {
        path: 'create',
        component: MeetingCreateComponent
    },
    {
        path: ':id',
        component: MeetingDetailComponent
    }
];

@NgModule({
    declarations: [
        MeetingListComponent,
        MeetingCreateComponent,
        MeetingDetailComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DatePipe,
        RouterModule.forChild(routes),
        // Material
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        MatSnackBarModule,
        MatListModule
    ]
})
export class MeetingsModule { }
