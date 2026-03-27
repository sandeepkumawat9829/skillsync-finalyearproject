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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { MentorProfileComponent } from './mentor-profile/mentor-profile.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorService } from '../../core/services/mentor.service';
import { Mentor } from '../../core/models/mentor.model';

@Component({
    selector: 'app-mentor-browse',
    templateUrl: './mentor-browse/mentor-browse.component.html',
    styleUrls: ['./mentor-browse/mentor-browse.component.scss']
})
export class MentorBrowseComponent implements OnInit {
    mentors: Mentor[] = [];
    filteredMentors: Mentor[] = [];
    loading = false;
    selectedProjectId: number | null = null;

    searchQuery = '';
    selectedDepartment = 'ALL';
    selectedAvailability = 'ALL';

    departments = ['ALL', 'Computer Science', 'Information Technology'];

    constructor(
        private mentorService: MentorService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'] ? +params['projectId'] : null;
        });
        this.loadMentors();
    }

    loadMentors(): void {
        this.loading = true;
        this.mentorService.getAllMentors().subscribe({
            next: (data) => {
                this.mentors = data;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading mentors', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.filteredMentors = this.mentors.filter(mentor => {
            const matchesSearch = !this.searchQuery ||
                mentor.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                mentor.expertise.some(e => e.toLowerCase().includes(this.searchQuery.toLowerCase()));

            const matchesDepartment = this.selectedDepartment === 'ALL' ||
                mentor.department === this.selectedDepartment;

            const matchesAvailability = this.selectedAvailability === 'ALL' ||
                (this.selectedAvailability === 'AVAILABLE' && mentor.isAvailable) ||
                (this.selectedAvailability === 'UNAVAILABLE' && !mentor.isAvailable);

            return matchesSearch && matchesDepartment && matchesAvailability;
        });
    }

    viewMentorProfile(mentor: Mentor): void {
        const routeId = mentor.userId || mentor.mentorId;
        this.router.navigate(['/student/mentors', routeId], {
            queryParams: this.selectedProjectId ? { projectId: this.selectedProjectId } : undefined,
            state: {
                mentor,
                mentorId: mentor.mentorId,
                userId: mentor.userId
            }
        });
    }

    getAvailabilityColor(isAvailable: boolean): string {
        return isAvailable ? 'green' : 'gray';
    }
}

const routes: Routes = [
    { path: '', component: MentorBrowseComponent },
    { path: ':id', component: MentorProfileComponent }
];

@NgModule({
    declarations: [
        MentorBrowseComponent,
        MentorProfileComponent
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
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatSnackBarModule
    ]
})
export class MentorsModule { }
