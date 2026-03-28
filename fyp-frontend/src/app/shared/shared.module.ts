import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillMatchingComponent } from './components/skill-matching/skill-matching.component';
import { PlagiarismCheckComponent } from './components/plagiarism-check/plagiarism-check.component';
import { ResourceLibraryComponent } from './components/resource-library/resource-library.component';
import { ToastComponent } from './components/toast/toast.component';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
    declarations: [
        SkillMatchingComponent,
        PlagiarismCheckComponent,
        ResourceLibraryComponent,
        ToastComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatSnackBarModule
    ],
    exports: [
        SkillMatchingComponent,
        PlagiarismCheckComponent,
        ResourceLibraryComponent,
        ToastComponent
    ]
})
export class SharedModule { }
