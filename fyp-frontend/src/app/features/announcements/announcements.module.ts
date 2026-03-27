import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementListComponent } from './announcement-list.component';

const routes: Routes = [
    { path: '', component: AnnouncementListComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class AnnouncementsModule { }
