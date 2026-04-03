import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { Team } from '../../../core/models/project.model';

@Component({
    selector: 'app-team-list',
    templateUrl: './team-list.component.html',
    styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
    teams: Team[] = [];
    loading = false;
    currentUserId: number | null = null;
    isProjectOwner = false;
    projectId: number | null = null;
    isViewingProjectTeams = false;

    constructor(
        private teamService: TeamService,
        private authService: AuthService,
        private projectService: ProjectService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {
        this.currentUserId = this.authService.currentUserValue?.userId || null;
    }

    ngOnInit(): void {
        this.loadTeams();
    }

    loadTeams(): void {
        this.loading = true;

        // Check if we are viewing teams for a specific project
        // Traverse parent routes to find the project 'id' param
        // (needed because lazy-loaded modules create intermediate route wrappers)
        let currentRoute = this.route.snapshot;
        let projectIdParam: string | null = null;
        while (currentRoute.parent && !projectIdParam) {
            currentRoute = currentRoute.parent;
            projectIdParam = currentRoute.paramMap.get('id');
        }
        this.projectId = projectIdParam ? +projectIdParam : null;
        this.isViewingProjectTeams = this.projectId !== null;

        if (this.projectId) {
            // First check if current user is the project owner
            this.projectService.getProjectById(this.projectId, this.currentUserId || 0).subscribe({
                next: (project) => {
                    this.isProjectOwner = project.createdById === this.currentUserId;
                },
                error: () => {
                    this.isProjectOwner = false;
                }
            });

            this.teamService.getTeamsByProject(this.projectId).subscribe({
                next: (data) => {
                    this.teams = data;
                    this.loading = false;
                },
                error: (error) => {
                    console.error('Error loading project teams:', error);
                    this.snackBar.open('Error loading project teams', 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
        } else {
            // Load user's teams - user is always "owner" of their own teams view
            this.isProjectOwner = true;
            this.teamService.getMyTeams().subscribe({
                next: (data) => {
                    this.teams = data;
                    this.loading = false;
                },
                error: () => {
                    this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
                    this.loading = false;
                }
            });
        }
    }

    createTeam(): void {
        if (this.projectId) {
            this.router.navigate(['/student/teams/create'], { queryParams: { projectId: this.projectId } });
        } else {
            this.router.navigate(['/student/teams/create']);
        }
    }

    viewTeam(teamId: number): void {
        this.router.navigate(['/student/teams', teamId]);
    }

    inviteMembers(team: any): void {
        this.snackBar.open('Invite functionality available in team details!', 'Close', { duration: 2000 });
    }

    requestToJoin(team: Team): void {
        this.teamService.requestToJoin(team.teamId).subscribe({
            next: () => {
                this.snackBar.open('Join request sent to team leader!', 'Close', { duration: 3000 });
            },
            error: (error) => {
                console.error('Error sending join request:', error);
                this.snackBar.open('Failed to send join request', 'Close', { duration: 3000 });
            }
        });
    }

    getStatusColor(status: string): string {
        const colors: any = {
            'FORMING': 'orange',
            'COMPLETE': 'green',
            'ACTIVE': 'blue',
            'DISBANDED': 'gray'
        };
        return colors[status] || 'gray';
    }

    getMemberProgress(team: Team): number {
        return (team.currentMemberCount / team.maxMembers) * 100;
    }

    isTeamLeader(team: Team): boolean {
        return this.currentUserId !== null && team.teamLeaderId === this.currentUserId;
    }

    isMember(team: Team): boolean {
        if (!this.currentUserId || !team.members) return false;
        return team.members.some(member => member.userId === this.currentUserId);
    }

    canShowInvite(team: Team): boolean {
        return this.isTeamLeader(team) && !team.isComplete;
    }

    canShowRequestJoin(team: Team): boolean {
        return !this.isMember(team) && !team.isComplete && this.isViewingProjectTeams;
    }
}
