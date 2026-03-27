import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SprintService } from '../../../core/services/sprint.service';
import { ProjectService } from '../../../core/services/project.service';
import { Sprint, SprintStatus } from '../../../core/models/sprint.model';
import { Project } from '../../../core/models/project.model';
import { CreateSprintDialogComponent } from '../create-sprint-dialog/create-sprint-dialog.component';

@Component({
    selector: 'app-sprint-list',
    templateUrl: './sprint-list.component.html',
    styleUrls: ['./sprint-list.component.scss']
})
export class SprintListComponent implements OnInit {
    sprints: Sprint[] = [];
    filteredSprints: Sprint[] = [];
    projects: Project[] = [];
    loading = true;
    selectedTab = 0;
    projectId: number | null = null;

    SprintStatus = SprintStatus;

    constructor(
        private sprintService: SprintService,
        private projectService: ProjectService,
        private dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.projectId = +(this.route.snapshot.queryParamMap.get('projectId') || 0) || null;
        this.loadProjects();
        if (this.projectId) {
            this.loadSprints();
        }
    }

    loadProjects(): void {
        this.projectService.getMyProjects().subscribe({
            next: (data) => {
                this.projects = data;
                if (this.projects.length > 0 && !this.projectId) {
                    this.projectId = this.projects[0].projectId;
                }

                if (this.projectId) {
                    this.loadSprints();
                }
            },
            error: () => {
                console.error('Error loading projects');
            }
        });
    }

    onProjectChange(projectId: number): void {
        this.projectId = projectId;
        this.loadSprints();
    }

    loadSprints(): void {
        if (!this.projectId) {
            this.sprints = [];
            this.filteredSprints = [];
            this.loading = false;
            return;
        }

        this.loading = true;
        this.sprintService.getSprintsByProject(this.projectId).subscribe({
            next: (data) => {
                this.sprints = data.sort((a, b) => b.sprintNumber - a.sprintNumber);
                this.filterSprints();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading sprints', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    filterSprints(): void {
        switch (this.selectedTab) {
            case 0: // All
                this.filteredSprints = this.sprints;
                break;
            case 1: // Active
                this.filteredSprints = this.sprints.filter(s => s.status === SprintStatus.ACTIVE);
                break;
            case 2: // Completed
                this.filteredSprints = this.sprints.filter(s => s.status === SprintStatus.COMPLETED);
                break;
        }
    }

    onTabChange(index: number): void {
        this.selectedTab = index;
        this.filterSprints();
    }

    openCreateDialog(): void {
        if (!this.projectId) {
            this.snackBar.open('Select a project before creating a sprint', 'Close', { duration: 3000 });
            return;
        }

        const dialogRef = this.dialog.open(CreateSprintDialogComponent, {
            width: '600px',
            data: { projectId: this.projectId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadSprints();
            }
        });
    }

    viewSprintBoard(sprint: Sprint): void {
        this.router.navigate(['/student/tasks/board'], {
            queryParams: { projectId: this.projectId, sprintId: sprint.sprintId }
        });
    }

    completeSprint(sprint: Sprint, event: Event): void {
        event.stopPropagation();

        if (confirm(`Complete ${sprint.sprintName}?`)) {
            this.sprintService.completeSprint(sprint.sprintId).subscribe({
                next: () => {
                    this.snackBar.open('Sprint completed!', 'Close', { duration: 3000 });
                    this.loadSprints();
                },
                error: () => {
                    this.snackBar.open('Error completing sprint', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getProgressPercentage(sprint: Sprint): number {
        return this.sprintService.getProgressPercentage(sprint);
    }

    getDaysRemaining(sprint: Sprint): number {
        return this.sprintService.getDaysRemaining(sprint);
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    getStatusClass(status: SprintStatus): string {
        switch (status) {
            case SprintStatus.ACTIVE: return 'active';
            case SprintStatus.COMPLETED: return 'completed';
            case SprintStatus.PLANNED: return 'planned';
            default: return '';
        }
    }
}
