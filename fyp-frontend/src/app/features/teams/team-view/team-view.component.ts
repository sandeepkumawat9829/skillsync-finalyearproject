import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team, TeamMember } from '../../../core/models/project.model';
import { JoinRequest } from '../../../core/models/invitation.model';

@Component({
    selector: 'app-team-view',
    templateUrl: './team-view.component.html',
    styleUrls: ['./team-view.component.scss']
})
export class TeamViewComponent implements OnInit {
    team: Team | null = null;
    loading = true;
    teamId!: number;
    currentUserId: number | null = null;
    currentUserRole: 'STUDENT' | 'MENTOR' | 'ADMIN' | null = null;

    inviteForm!: FormGroup;
    showInviteForm = false;
    isInviting = false;

    // Join requests
    joinRequests: JoinRequest[] = [];
    loadingRequests = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private teamService: TeamService,
        private authService: AuthService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        this.currentUserId = this.authService.currentUserValue?.userId || null;
        this.currentUserRole = this.authService.currentUserValue?.role || null;
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.teamId = +params['id'];
            this.loadTeam();
        });

        this.initInviteForm();
    }

    initInviteForm(): void {
        this.inviteForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            message: ['Join our team!', Validators.required]
        });
    }

    loadTeam(): void {
        this.loading = true;
        this.teamService.getTeamById(this.teamId).subscribe({
            next: (data) => {
                this.team = data;
                this.loading = false;
                // Debug logging
                console.log('Current User ID:', this.currentUserId);
                console.log('Team Leader ID:', this.team?.teamLeaderId);
                console.log('Is Team Leader:', this.isTeamLeader());
                // Load join requests if current user is team leader
                if (this.isTeamLeader()) {
                    this.loadJoinRequests();
                }
            },
            error: (error) => {
                const message = error?.error?.message || 'Error loading team';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.loading = false;
                this.router.navigate([this.getTeamsRoute()]);
            }
        });
    }

    loadJoinRequests(): void {
        this.loadingRequests = true;
        console.log('Loading join requests for team:', this.teamId);
        this.teamService.getJoinRequests(this.teamId).subscribe({
            next: (data) => {
                console.log('Join requests received:', data);
                this.joinRequests = data;
                this.loadingRequests = false;
            },
            error: (err) => {
                console.error('Error loading join requests:', err);
                this.loadingRequests = false;
            }
        });
    }

    acceptJoinRequest(request: JoinRequest): void {
        this.teamService.acceptJoinRequest(request.requestId).subscribe({
            next: () => {
                this.snackBar.open('Join request accepted!', 'Close', { duration: 3000 });
                this.loadTeam(); // Reload team to show new member
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Error accepting request', 'Close', { duration: 3000 });
            }
        });
    }

    rejectJoinRequest(request: JoinRequest): void {
        this.teamService.rejectJoinRequest(request.requestId).subscribe({
            next: () => {
                this.snackBar.open('Join request rejected', 'Close', { duration: 2000 });
                this.joinRequests = this.joinRequests.filter(r => r.requestId !== request.requestId);
            },
            error: () => {
                this.snackBar.open('Error rejecting request', 'Close', { duration: 3000 });
            }
        });
    }

    toggleInviteForm(): void {
        this.showInviteForm = !this.showInviteForm;
        if (!this.showInviteForm) {
            this.inviteForm.reset({ message: 'Join our team!' });
        }
    }

    sendInvitation(): void {
        if (this.inviteForm.invalid || !this.team) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isInviting = true;
        const request = {
            teamId: this.team.teamId,
            email: this.inviteForm.value.email,
            message: this.inviteForm.value.message
        };

        this.teamService.sendInvitation(this.team.teamId, request).subscribe({
            next: () => {
                this.snackBar.open('Invitation sent successfully!', 'Close', { duration: 3000 });
                this.inviteForm.reset({ message: 'Join our team!' });
                this.showInviteForm = false;
                this.isInviting = false;
            },
            error: (err) => {
                const msg = err.error?.message || 'Error sending invitation';
                this.snackBar.open(msg, 'Close', { duration: 3000 });
                this.isInviting = false;
            }
        });
    }

    removeMember(member: TeamMember): void {
        if (!this.team || member.role === 'LEADER') {
            return;
        }

        if (confirm(`Remove ${member.fullName} from the team?`)) {
            this.teamService.removeMember(this.team.teamId, member.memberId).subscribe({
                next: () => {
                    this.snackBar.open('Member removed successfully', 'Close', { duration: 3000 });
                    this.loadTeam();
                },
                error: () => {
                    this.snackBar.open('Error removing member', 'Close', { duration: 3000 });
                }
            });
        }
    }

    deleteTeam(): void {
        if (!this.team) return;

        if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            this.teamService.deleteTeam(this.team.teamId).subscribe({
                next: () => {
                    this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
                    this.router.navigate([this.getTeamsRoute()]);
                },
                error: () => {
                    this.snackBar.open('Error deleting team', 'Close', { duration: 3000 });
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate([this.getTeamsRoute()]);
    }

    viewProject(): void {
        if (this.team?.projectId) {
            this.router.navigate([this.getProjectsRoute(), this.team.projectId]);
        }
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

    getRoleColor(role: string): string {
        return role === 'LEADER' ? 'accent' : 'primary';
    }

    getMemberProgress(): number {
        if (!this.team) return 0;
        return (this.team.currentMemberCount / this.team.maxMembers) * 100;
    }

    isTeamLeader(): boolean {
        return this.currentUserId !== null && this.team?.teamLeaderId === this.currentUserId;
    }

    private getTeamsRoute(): string {
        return this.currentUserRole === 'MENTOR' ? '/mentor/teams' : '/student/teams';
    }

    private getProjectsRoute(): string {
        return this.currentUserRole === 'MENTOR' ? '/mentor/projects' : '/student/projects';
    }
}
