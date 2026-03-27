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
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';

const routes: Routes = [
    { path: '', component: ProjectListComponent },
    { path: 'create', component: ProjectCreateComponent },
    { path: ':id', component: ProjectDetailComponent },
    {
        path: ':id/documents',
        loadChildren: () => import('../documents/documents.module').then(m => m.DocumentsModule)
    },
    {
        path: ':id/issues',
        loadChildren: () => import('../issues/issues.module').then(m => m.IssuesModule)
    },
    {
        path: ':id/teams',
        loadChildren: () => import('../teams/teams.module').then(m => m.TeamsModule)
    }
];

@NgModule({
    declarations: [
        ProjectListComponent,
        ProjectCreateComponent,
        ProjectDetailComponent
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
        MatTabsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatStepperModule,
        MatRadioModule,
        MatMenuModule
    ]
})
export class ProjectsModule { }
