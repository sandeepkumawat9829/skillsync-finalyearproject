import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { AssignedTeam } from '../../../core/models/mentor.model';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { MentorService } from '../../../core/services/mentor.service';

@Component({
    selector: 'app-project-selector',
    templateUrl: './project-selector.component.html',
    styleUrls: ['./project-selector.component.scss']
})
export class ProjectSelectorComponent implements OnInit {
    projects: Project[] = [];
    loading = true;

    constructor(
        private projectService: ProjectService,
        private mentorService: MentorService,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadProjects();
    }

    loadProjects(): void {
        this.loading = true;

        if (this.authService.currentUserValue?.role === 'MENTOR') {
            this.loadMentorProjects();
            return;
        }

        this.projectService.getMyProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading projects', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    private loadMentorProjects(): void {
        this.mentorService.getMyAssignments().subscribe({
            next: (assignments) => {
                this.projects = assignments.map((assignment) => this.mapAssignmentToProject(assignment));
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading assigned projects', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    selectProject(project: Project): void {
        this.router.navigate([this.getTaskBoardRoute()], {
            queryParams: { projectId: project.projectId }
        });
    }

    goBack(): void {
        this.router.navigate([this.getDashboardRoute()]);
    }

    get isMentorView(): boolean {
        return this.authService.currentUserValue?.role === 'MENTOR';
    }

    get emptyStateRoute(): string {
        return this.isMentorView ? '/mentor/teams' : '/student/projects/create';
    }

    get emptyStateAction(): string {
        return this.isMentorView ? 'Open My Teams' : 'Create Project';
    }

    get emptyStateMessage(): string {
        return this.isMentorView
            ? 'Accept a mentor assignment first, then open the team workspace from your dashboard or teams page.'
            : 'Create a project first to manage tasks.';
    }

    private mapAssignmentToProject(assignment: AssignedTeam): Project {
        return {
            projectId: assignment.projectId,
            title: assignment.projectTitle,
            abstractText: `${assignment.teamName} • ${this.formatStatus(assignment.projectStatus)} • ${assignment.memberCount} members`,
            fullDescription: '',
            technologies: [],
            domain: 'Mentor Assignment',
            createdById: 0,
            status: this.normalizeProjectStatus(assignment.projectStatus),
            visibility: 'PRIVATE',
            createdAt: assignment.assignedAt ? new Date(assignment.assignedAt).toISOString() : '',
            teamId: assignment.teamId,
            teamName: assignment.teamName,
            teamMemberCount: assignment.memberCount,
            hasMentor: true
        };
    }

    private normalizeProjectStatus(status: string): Project['status'] {
        const allowedStatuses: Project['status'][] = [
            'DRAFT',
            'TEAM_FORMING',
            'TEAM_COMPLETE',
            'PENDING_MENTOR',
            'MENTOR_ASSIGNED',
            'IN_PROGRESS',
            'COMPLETED',
            'ABANDONED'
        ];

        return allowedStatuses.includes(status as Project['status'])
            ? status as Project['status']
            : 'MENTOR_ASSIGNED';
    }

    private formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    private getTaskBoardRoute(): string {
        return this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/task-workspace/board'
            : '/student/tasks/board';
    }

    private getDashboardRoute(): string {
        return this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/dashboard'
            : '/student/dashboard';
    }
}
