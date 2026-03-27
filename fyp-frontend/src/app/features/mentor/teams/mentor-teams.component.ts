import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssignedTeam } from '../../../core/models/mentor.model';
import { MentorService } from '../../../core/services/mentor.service';

@Component({
    selector: 'app-mentor-teams',
    templateUrl: './mentor-teams.component.html',
    styleUrls: ['./mentor-teams.component.scss']
})
export class MentorTeamsComponent implements OnInit {
    teams: AssignedTeam[] = [];
    filteredTeams: AssignedTeam[] = [];
    loading = false;
    searchQuery = '';
    selectedStatus = 'ALL';

    constructor(
        private mentorService: MentorService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadTeams();
    }

    loadTeams(): void {
        this.loading = true;
        this.mentorService.getMyAssignments().subscribe({
            next: (teams) => {
                this.teams = teams;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                const message = error?.error?.message || 'Error loading assigned teams';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.filteredTeams = this.teams.filter(team => {
            const normalizedQuery = this.searchQuery.trim().toLowerCase();
            const matchesQuery = !normalizedQuery
                || team.teamName.toLowerCase().includes(normalizedQuery)
                || team.projectTitle.toLowerCase().includes(normalizedQuery);

            const matchesStatus = this.selectedStatus === 'ALL' || team.projectStatus === this.selectedStatus;
            return matchesQuery && matchesStatus;
        });
    }

    viewTeam(team: AssignedTeam): void {
        this.router.navigate(['/mentor/team-workspace', team.teamId]);
    }

    openKanban(team: AssignedTeam): void {
        this.router.navigate(['/mentor/task-workspace/board'], {
            queryParams: { projectId: team.projectId }
        });
    }

    openProject(team: AssignedTeam): void {
        this.router.navigate(['/mentor/projects', team.projectId]);
    }

    get activeCount(): number {
        return this.teams.filter(team => team.status === 'ACTIVE').length;
    }

    get completedProjectsCount(): number {
        return this.teams.filter(team => team.projectStatus === 'COMPLETED').length;
    }

    get averageTeamSize(): number {
        if (this.teams.length === 0) {
            return 0;
        }

        const totalMembers = this.teams.reduce((sum, team) => sum + (team.memberCount || 0), 0);
        return Number((totalMembers / this.teams.length).toFixed(1));
    }

    get averageProgress(): number {
        if (this.teams.length === 0) {
            return 0;
        }
        const total = this.teams.reduce((sum, team) => sum + (team.progress || 0), 0);
        return Math.round(total / this.teams.length);
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    getAssignmentTone(team: AssignedTeam): string {
        if (team.projectStatus === 'COMPLETED') {
            return 'tone-complete';
        }

        if (team.projectStatus === 'IN_PROGRESS') {
            return 'tone-progress';
        }

        if (team.projectStatus === 'PENDING_MENTOR' || team.projectStatus === 'TEAM_COMPLETE') {
            return 'tone-attention';
        }

        return 'tone-steady';
    }

    getProgressState(team: AssignedTeam): string {
        if ((team.progress || 0) >= 75) {
            return 'Strong momentum';
        }

        if ((team.progress || 0) >= 40) {
            return 'On track';
        }

        if (team.projectStatus === 'TEAM_FORMING') {
            return 'Team still forming';
        }

        return 'Needs follow-up';
    }

    trackByTeamId(_: number, team: AssignedTeam): number {
        return team.teamId;
    }

    getStatusClass(status: string): string {
        const mapping: Record<string, string> = {
            TEAM_FORMING: 'status-forming',
            TEAM_COMPLETE: 'status-complete',
            PENDING_MENTOR: 'status-pending',
            MENTOR_ASSIGNED: 'status-assigned',
            IN_PROGRESS: 'status-progress',
            COMPLETED: 'status-done'
        };
        return mapping[status] || 'status-default';
    }
}
