import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../core/services/team.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
    selector: 'app-team-create',
    templateUrl: './team-create.component.html',
    styleUrls: ['./team-create.component.scss']
})
export class TeamCreateComponent implements OnInit {
    teamForm!: FormGroup;
    projects: Project[] = [];
    loading = false;
    isSubmitting = false;
    selectedProjectId: number | null = null;

    constructor(
        private fb: FormBuilder,
        private teamService: TeamService,
        private projectService: ProjectService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.initializeForm();
        this.loadProjects();

        // Check if project ID is passed via query params
        this.route.queryParams.subscribe(params => {
            if (params['projectId']) {
                this.selectedProjectId = +params['projectId'];
                this.teamForm.patchValue({ projectId: this.selectedProjectId });
            }
        });
    }

    initializeForm(): void {
        this.teamForm = this.fb.group({
            teamName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            projectId: ['', Validators.required],
            maxMembers: [4, [Validators.required, Validators.min(2), Validators.max(10)]]
        });
    }

    loadProjects(): void {
        this.loading = true;
        this.projectService.getMyProjects().subscribe({
            next: (data) => {
                console.log('Loaded projects:', data);
                // Show all user's projects (remove status filter)
                this.projects = data;
                this.loading = false;

                if (data.length === 0) {
                    this.snackBar.open('No projects found. Create a project first before creating a team.', 'Close', { duration: 5000 });
                }
            },
            error: (err) => {
                console.error('Error loading projects:', err);
                this.snackBar.open('Error loading projects. Please ensure you are logged in.', 'Close', { duration: 5000 });
                this.loading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.teamForm.invalid) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSubmitting = true;
        this.teamService.createTeam(this.teamForm.value).subscribe({
            next: (team) => {
                this.snackBar.open('Team created successfully!', 'Close', { duration: 3000 });
                this.router.navigate(['/student/teams']);
            },
            error: () => {
                this.snackBar.open('Error creating team', 'Close', { duration: 3000 });
                this.isSubmitting = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/student/teams']);
    }

    getProjectById(id: number): Project | undefined {
        return this.projects.find(p => p.projectId === id);
    }
}
