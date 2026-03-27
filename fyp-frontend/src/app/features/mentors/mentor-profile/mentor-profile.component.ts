import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { MentorService } from '../../../core/services/mentor.service';
import { ProjectService } from '../../../core/services/project.service';
import { Mentor, MentorRequest } from '../../../core/models/mentor.model';
import { Project } from '../../../core/models/project.model';

@Component({
    selector: 'app-mentor-profile',
    templateUrl: './mentor-profile.component.html',
    styleUrls: ['./mentor-profile.component.scss']
})
export class MentorProfileComponent implements OnInit {
    mentor: Mentor | null = null;
    myProjects: Project[] = [];
    loading = true;
    mentorId!: number;
    private mentorLookupIds: number[] = [];
    selectedProjectId: number | null = null;

    showRequestForm = false;
    requestForm!: FormGroup;
    isSubmitting = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private mentorService: MentorService,
        private projectService: ProjectService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.mentorId = +params['id'];
            const navigationState = history.state as { mentor?: Mentor; mentorId?: number; userId?: number };
            if (navigationState?.mentor) {
                this.mentor = navigationState.mentor;
                this.loading = false;
            }

            this.mentorLookupIds = [this.mentorId, navigationState?.mentorId, navigationState?.userId]
                .filter((id): id is number => typeof id === 'number' && Number.isFinite(id) && id > 0)
                .filter((id, index, ids) => ids.indexOf(id) === index);

            if (!this.mentor) {
                this.loadMentor();
            }
            this.loadMyProjects();
        });

        this.route.queryParams.subscribe(params => {
            this.selectedProjectId = params['projectId'] ? +params['projectId'] : null;
            if (this.selectedProjectId && this.requestForm) {
                this.requestForm.patchValue({ projectId: this.selectedProjectId });
            }
        });

        this.initRequestForm();
    }

    initRequestForm(): void {
        this.requestForm = this.fb.group({
            projectId: ['', Validators.required],
            message: ['I would like your guidance on my project.', [Validators.required, Validators.minLength(20)]]
        });
    }

    loadMentor(): void {
        this.loading = true;
        this.tryLoadMentor(0);
    }

    private tryLoadMentor(index: number): void {
        const lookupId = this.mentorLookupIds[index];
        if (!lookupId) {
            this.loading = false;
            this.snackBar.open('Error loading mentor profile', 'Close', { duration: 3000 });
            this.router.navigate(['/student/mentors']);
            return;
        }

        this.mentorService.getMentorById(lookupId)
            .pipe(finalize(() => {
                if (index >= this.mentorLookupIds.length - 1 || this.mentor) {
                    this.loading = false;
                }
            }))
            .subscribe({
                next: (data) => {
                    this.mentor = data;
                },
                error: () => {
                    this.tryLoadMentor(index + 1);
                }
            });
    }

    loadMyProjects(): void {
        this.projectService.getMyProjects().subscribe({
            next: (data) => {
                this.myProjects = data.filter(p =>
                    p.status !== 'DRAFT' && p.status !== 'ABANDONED' && p.status !== 'COMPLETED'
                );
                if (this.selectedProjectId && this.myProjects.some(project => project.projectId === this.selectedProjectId)) {
                    this.requestForm.patchValue({ projectId: this.selectedProjectId });
                }
            },
            error: () => {
                console.error('Error loading projects');
            }
        });
    }

    toggleRequestForm(): void {
        this.showRequestForm = !this.showRequestForm;
        if (!this.showRequestForm) {
            this.requestForm.reset({ message: 'I would like your guidance on my project.' });
        }
    }

    sendRequest(): void {
        if (this.requestForm.invalid || !this.mentor) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        const selectedProject = this.myProjects.find(p => p.projectId === this.requestForm.value.projectId);
        if (!selectedProject) return;

        this.isSubmitting = true;
        const requestData: any = {
            mentorId: this.mentor.mentorId,
            mentorName: this.mentor.fullName,
            projectId: selectedProject.projectId,
            projectTitle: selectedProject.title,
            message: this.requestForm.value.message
        };

        this.mentorService.sendMentorRequest(requestData).subscribe({
            next: () => {
                this.snackBar.open('Request sent successfully!', 'Close', { duration: 3000 });
                this.requestForm.reset({ message: 'I would like your guidance on my project.' });
                this.showRequestForm = false;
                this.isSubmitting = false;
            },
            error: (err) => {
                const msg = err?.error?.message || 'Error sending request';
                this.snackBar.open(msg, 'Close', { duration: 5000 });
                this.isSubmitting = false;
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/student/mentors']);
    }

    getAvailabilityColor(isAvailable: boolean): string {
        return isAvailable ? 'green' : 'gray';
    }

    getCapacityPercentage(): number {
        if (!this.mentor) return 0;
        return (this.mentor.currentStudents / this.mentor.maxStudents) * 100;
    }
}
