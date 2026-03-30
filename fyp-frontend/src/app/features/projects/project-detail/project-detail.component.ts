import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { TeamService } from '../../../core/services/team.service';
import { Project, Team } from '../../../core/models/project.model';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit {
    project: Project | null = null;
    team: Team | null = null;
    loading = true;
    projectId!: number;
    isRestricted = false;
    currentUser: User | null = null;
    isOwner = false;
    loadingTeam = false;
    canAccessWorkspace = false;
    requestingJoin = false;
    joinRequestAlreadySent = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private teamService: TeamService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.route.params.subscribe(params => {
            this.projectId = +params['id'];
            this.loadProject();
        });
    }

    loadProject(): void {
        this.loading = true;
        const currentUserId = this.currentUser?.userId || 0;

        this.projectService.getProjectById(this.projectId, currentUserId).subscribe({
            next: (data) => {
                this.project = data;
                this.isRestricted = this.project.fullDescription === '[Protected]';
                this.isOwner = this.currentUser?.userId === this.project.createdById;
                this.loading = false;

                this.resolveWorkspaceAccess();
                this.resolveJoinRequestState();

                if (this.project.teamId || this.project.teamName) {
                    this.loadTeam();
                } else {
                    this.team = null;
                }
            },
            error: (error) => {
                const message = error?.error?.message || 'Error loading project';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.loading = false;
                this.router.navigate([this.getProjectsRoute()]);
            }
        });
    }

    loadTeam(): void {
        this.loadingTeam = true;
        this.teamService.getTeamByProject(this.projectId).subscribe({
            next: (team) => {
                this.team = team;
                this.loadingTeam = false;
                this.resolveWorkspaceAccess();
                this.resolveJoinRequestState();
            },
            error: () => {
                this.team = null;
                this.loadingTeam = false;
                this.resolveWorkspaceAccess();
                this.resolveJoinRequestState();
            }
        });
    }

    goBack(): void {
        this.router.navigate([this.getProjectsRoute()]);
    }

    editProject(): void {
        this.snackBar.open('Edit project flow is not wired yet', 'Close', { duration: 2500 });
    }

    deleteProject(): void {
        if (!confirm('Are you sure you want to delete this project?')) {
            return;
        }

        this.projectService.deleteProject(this.projectId).subscribe({
            next: () => {
                this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
                this.router.navigate([this.getProjectsRoute()]);
            },
            error: (error) => {
                const message = error?.error?.message || 'Error deleting project';
                this.snackBar.open(message, 'Close', { duration: 3000 });
            }
        });
    }

    createTeam(): void {
        if (this.team?.teamId) {
            this.router.navigate([this.getTeamWorkspaceRoute(), this.team.teamId]);
            return;
        }

        this.router.navigate([`${this.getTeamWorkspaceRoute()}/create`], {
            queryParams: { projectId: this.projectId }
        });
    }

    viewTeam(): void {
        if (this.team?.teamId) {
            this.router.navigate([this.getTeamWorkspaceRoute(), this.team.teamId]);
            return;
        }

        this.router.navigate([this.getProjectsRoute(), this.projectId, 'teams']);
    }

    requestToJoinTeam(): void {
        const teamId = this.team?.teamId || this.project?.teamId;
        if (!teamId) {
            this.snackBar.open('Team not available yet for this project', 'Close', { duration: 3000 });
            return;
        }

        this.requestingJoin = true;
        this.teamService.requestToJoin(teamId).subscribe({
            next: () => {
                this.snackBar.open('Join request sent to the team leader', 'Close', { duration: 3000 });
                this.requestingJoin = false;
                this.joinRequestAlreadySent = true;
            },
            error: (error) => {
                const message = error?.error?.message || 'Failed to send join request';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.requestingJoin = false;
                if (error?.error?.errorCode === 'DUPLICATE_REQUEST') {
                    this.joinRequestAlreadySent = true;
                }
            }
        });
    }

    findMentor(): void {
        if (!this.canRequestMentor) {
            const message = this.team
                ? 'Complete your team before requesting a mentor'
                : 'Your project team is still loading';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            return;
        }

        this.router.navigate([this.getMentorsRoute()], {
            queryParams: { projectId: this.projectId }
        });
    }

    getDomainIcon(domain: string): string {
        const icons: Record<string, string> = {
            AI_ML: 'psychology',
            WEB_APP: 'web',
            MOBILE_APP: 'phone_android',
            IOT: 'devices',
            BLOCKCHAIN: 'link',
            DATA_SCIENCE: 'analytics',
            CYBER_SECURITY: 'security',
            CLOUD_COMPUTING: 'cloud',
            OTHER: 'category'
        };
        return icons[domain] || 'folder';
    }

    getStatusColor(status: string): string {
        const colors: Record<string, string> = {
            DRAFT: 'gray',
            TEAM_FORMING: 'blue',
            TEAM_COMPLETE: 'green',
            PENDING_MENTOR: 'orange',
            MENTOR_ASSIGNED: 'purple',
            IN_PROGRESS: 'orange',
            COMPLETED: 'green',
            ABANDONED: 'red'
        };
        return colors[status] || 'gray';
    }

    formatDate(date: string | Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    get manageTeamLabel(): string {
        return this.team?.teamId ? 'Manage Team' : 'Create Team';
    }

    get canRequestMentor(): boolean {
        return this.isOwner && !!this.team && (this.team.status === 'COMPLETE' || this.team.status === 'MENTOR_REQUESTED') && !this.project?.hasMentor;
    }

    get canRequestJoin(): boolean {
        if (this.isOwner) return false;
        if (this.isRestricted) return false;
        if (this.joinRequestAlreadySent) return false;
        const teamId = this.team?.teamId || this.project?.teamId;
        if (!teamId) return false;
        const status = this.team?.status || this.project?.teamStatus;
        return status === 'FORMING' || status === 'COMPLETE' || status === 'MENTOR_REQUESTED' || status === 'ACTIVE';
    }

    private resolveJoinRequestState(): void {
        const teamId = this.team?.teamId || this.project?.teamId;
        if (!teamId || !this.currentUser?.userId) {
            this.joinRequestAlreadySent = false;
            return;
        }
        this.teamService.getMySentJoinRequests().subscribe({
            next: (reqs) => {
                this.joinRequestAlreadySent = (reqs ?? []).some(r => r.teamId === teamId && r.status === 'PENDING');
            },
            error: () => {
                // Don't block UI if endpoint fails
                this.joinRequestAlreadySent = false;
            }
        });
    }

    get showTeamWorkspaceActions(): boolean {
        return this.canAccessWorkspace && !this.isRestricted;
    }

    private resolveWorkspaceAccess(): void {
        if (!this.project) {
            this.canAccessWorkspace = false;
            return;
        }
        if (this.isOwner) {
            this.canAccessWorkspace = true;
            return;
        }

        const uid = this.currentUser?.userId;
        if (!uid) {
            this.canAccessWorkspace = false;
            return;
        }

        // If team already loaded, decide instantly
        if (this.team) {
            const isLeader = this.team.teamLeaderId === uid;
            const isMember = Array.isArray(this.team.members) && this.team.members.some(m => m.userId === uid);
            const isMentor = this.currentUser?.role === 'MENTOR' && this.team.mentorId === uid;
            this.canAccessWorkspace = isLeader || isMember || isMentor;
            return;
        }

        // Fallback: query my teams and compare projectId
        this.teamService.getMyTeamsList().subscribe({
            next: (teams) => {
                this.canAccessWorkspace = (teams ?? []).some(t => t.projectId === this.projectId);
            },
            error: () => {
                this.canAccessWorkspace = false;
            }
        });
    }

    getBaseRoute(): string {
        return this.currentUser?.role === 'MENTOR' ? '/mentor' : '/student';
    }

    getBoardRoute(): string {
        return this.currentUser?.role === 'MENTOR' ? '/mentor/task-workspace/board' : '/student/tasks/board';
    }

    private getProjectsRoute(): string {
        return this.currentUser?.role === 'MENTOR' ? '/mentor/projects' : '/student/projects';
    }

    private getTeamWorkspaceRoute(): string {
        return this.currentUser?.role === 'MENTOR' ? '/mentor/team-workspace' : '/student/teams';
    }

    private getMentorsRoute(): string {
        return '/student/mentors';
    }
}
