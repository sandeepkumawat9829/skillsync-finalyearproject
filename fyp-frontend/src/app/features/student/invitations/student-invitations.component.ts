import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../core/services/team.service';
import { TeamInvitation } from '../../../core/models/invitation.model';
import { JoinRequest } from '../../../core/models/invitation.model';

@Component({
    selector: 'app-student-invitations',
    templateUrl: './student-invitations.component.html',
    styleUrls: ['./student-invitations.component.scss']
})
export class StudentInvitationsComponent implements OnInit {
    invitations: TeamInvitation[] = [];
    filteredInvitations: TeamInvitation[] = [];
    loading = true;

    selectedFilter = 'ALL';

    sentJoinRequests: JoinRequest[] = [];
    loadingSentRequests = false;

    constructor(
        private teamService: TeamService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadInvitations();
        this.loadSentJoinRequests();
    }

    loadInvitations(): void {
        this.loading = true;
        this.teamService.getMyInvitations().subscribe({
            next: (data) => {
                this.invitations = data;
                this.applyFilter();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading invitations', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    loadSentJoinRequests(): void {
        this.loadingSentRequests = true;
        this.teamService.getMySentJoinRequests().subscribe({
            next: (data) => {
                this.sentJoinRequests = data || [];
                this.loadingSentRequests = false;
            },
            error: () => {
                this.loadingSentRequests = false;
            }
        });
    }

    applyFilter(): void {
        if (this.selectedFilter === 'ALL') {
            this.filteredInvitations = this.invitations;
        } else {
            this.filteredInvitations = this.invitations.filter(
                inv => inv.status === this.selectedFilter
            );
        }
    }

    acceptInvitation(invitation: TeamInvitation): void {
        this.teamService.respondToInvitation(invitation.invitationId, true).subscribe({
            next: () => {
                this.snackBar.open('Invitation accepted!', 'Close', { duration: 3000 });
                invitation.status = 'ACCEPTED';
                invitation.respondedAt = new Date();
                this.applyFilter();
            },
            error: () => {
                this.snackBar.open('Error accepting invitation', 'Close', { duration: 3000 });
            }
        });
    }

    rejectInvitation(invitation: TeamInvitation): void {
        this.teamService.respondToInvitation(invitation.invitationId, false).subscribe({
            next: () => {
                this.snackBar.open('Invitation rejected', 'Close', { duration: 2000 });
                invitation.status = 'REJECTED';
                invitation.respondedAt = new Date();
                this.applyFilter();
            },
            error: () => {
                this.snackBar.open('Error rejecting invitation', 'Close', { duration: 3000 });
            }
        });
    }

    viewTeam(teamId: number): void {
        this.router.navigate(['/student/teams', teamId]);
    }

    getStatusClass(status: string): string {
        const classes: any = {
            'PENDING': 'pending',
            'ACCEPTED': 'accepted',
            'REJECTED': 'rejected'
        };
        return classes[status] || '';
    }
}
