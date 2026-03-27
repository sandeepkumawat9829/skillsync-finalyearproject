import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MilestoneListComponent } from './milestone-list.component';

const routes: Routes = [
    { path: '', component: MilestoneListComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class MilestonesModule { }
