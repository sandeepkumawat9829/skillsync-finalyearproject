import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { HomeComponent } from './features/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'student',
    loadChildren: () => import('./features/student/student.module').then(m => m.StudentModule)
  },
  {
    path: 'mentor',
    loadChildren: () => import('./features/mentor/mentor.module').then(m => m.MentorModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'showcase',
    loadChildren: () => import('./features/showcase/showcase.module').then(m => m.ShowcaseModule)
  },
  {
    path: 'milestones',
    loadChildren: () => import('./features/milestones/milestones.module').then(m => m.MilestonesModule)
  },
  {
    path: 'templates',
    loadChildren: () => import('./features/templates/templates.module').then(m => m.TemplatesModule)
  },
  {
    path: 'announcements',
    loadChildren: () => import('./features/announcements/announcements.module').then(m => m.AnnouncementsModule)
  },
  {
    path: 'buckets',
    loadChildren: () => import('./features/buckets/buckets.module').then(m => m.BucketsModule)
  },
  {
    path: 'analytics',
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
