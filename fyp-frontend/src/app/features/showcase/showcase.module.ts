import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ShowcaseGalleryComponent } from './showcase-gallery/showcase-gallery.component';
import { ShowcaseDetailComponent } from './showcase-detail/showcase-detail.component';

const routes: Routes = [
    { path: '', component: ShowcaseGalleryComponent },
    { path: ':id', component: ShowcaseDetailComponent }
];

@NgModule({
    declarations: [
        ShowcaseGalleryComponent,
        ShowcaseDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes)
    ]
})
export class ShowcaseModule { }
