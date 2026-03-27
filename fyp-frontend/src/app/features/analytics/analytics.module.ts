import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './analytics-dashboard.component';

const routes: Routes = [
    {
        path: '',
        component: AnalyticsDashboardComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)]
})
export class AnalyticsModule { }
