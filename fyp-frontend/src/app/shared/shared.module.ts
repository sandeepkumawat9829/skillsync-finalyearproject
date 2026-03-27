import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SkillMatchingComponent } from './components/skill-matching/skill-matching.component';
import { PlagiarismCheckComponent } from './components/plagiarism-check/plagiarism-check.component';
import { ResourceLibraryComponent } from './components/resource-library/resource-library.component';

@NgModule({
    declarations: [
        SkillMatchingComponent,
        PlagiarismCheckComponent,
        ResourceLibraryComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        SkillMatchingComponent,
        PlagiarismCheckComponent,
        ResourceLibraryComponent
    ]
})
export class SharedModule { }
