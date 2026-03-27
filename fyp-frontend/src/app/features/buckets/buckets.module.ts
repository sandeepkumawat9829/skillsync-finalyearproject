import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BucketListComponent } from './bucket-list.component';

const routes: Routes = [
    { path: '', component: BucketListComponent }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class BucketsModule { }
