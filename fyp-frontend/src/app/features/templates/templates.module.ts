import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TemplateSelectorComponent } from './template-selector.component';

const routes: Routes = [
    { path: '', component: TemplateSelectorComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class TemplatesModule { }
