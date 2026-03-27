import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorService } from '../../../core/services/mentor.service';
import { MentorRequest } from '../../../core/models/mentor.model';

@Component({
    selector: 'app-mentor-requests',
    templateUrl: './mentor-requests.component.html',
    styleUrls: ['./mentor-requests.component.scss']
})
export class MentorRequestsComponent implements OnInit {
    loading = false;
    selectedTab = 0; // 0 = Pending, 1 = Accepted, 2 = Rejected

    allRequests: MentorRequest[] = [];
    pendingRequests: MentorRequest[] = [];
    acceptedRequests: MentorRequest[] = [];
    rejectedRequests: MentorRequest[] = [];

    constructor(
        private mentorService: MentorService,
        private router: Router,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadRequests();
    }

    loadRequests(): void {
        this.loading = true;

        this.mentorService.getAllMentorRequests().subscribe({
            next: (data) => {
                this.allRequests = data;
                this.filterRequests();
                this.loading = false;
            },
            error: (err) => {
                const msg = err?.error?.message || 'Error loading requests';
                this.snackBar.open(msg, 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    filterRequests(): void {
        this.pendingRequests = this.allRequests.filter(r => r.status === 'PENDING');
        this.acceptedRequests = this.allRequests.filter(r => r.status === 'ACCEPTED');
        this.rejectedRequests = this.allRequests.filter(r => r.status === 'REJECTED');
    }

    acceptRequest(request: MentorRequest): void {
        const dialogRef = this.dialog.open(AcceptDialogComponent, {
            width: '500px',
            data: { request }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.mentorService.acceptMentorRequest(request.requestId, result.feedback).subscribe({
                    next: () => {
                        this.snackBar.open('Request accepted successfully!', 'Close', { duration: 3000 });
                        this.loadRequests(); // Reload to update lists
                    },
                    error: () => {
                        this.snackBar.open('Error accepting request', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
            }
        });
    }

    rejectRequest(request: MentorRequest): void {
        const dialogRef = this.dialog.open(RejectDialogComponent, {
            width: '500px',
            data: { request }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.mentorService.rejectMentorRequest(request.requestId, result.reason).subscribe({
                    next: () => {
                        this.snackBar.open('Request rejected', 'Close', { duration: 3000 });
                        this.loadRequests(); // Reload to update lists
                    },
                    error: () => {
                        this.snackBar.open('Error rejecting request', 'Close', { duration: 3000 });
                        this.loading = false;
                    }
                });
            }
        });
    }

    viewTeam(teamId: number): void {
        this.router.navigate(['/mentor/team-workspace', teamId]);
    }

    goBack(): void {
        this.router.navigate(['/mentor/dashboard']);
    }
}

// Accept Dialog Component
@Component({
    selector: 'app-accept-dialog',
    template: `
        <h2 mat-dialog-title>Accept Mentor Request</h2>
        <mat-dialog-content>
            <p>You are about to accept the mentor request from <strong>{{data.request.teamName}}</strong> for the project <strong>{{data.request.projectTitle}}</strong>.</p>
            <div class="capacity-warning">
                <mat-icon color="primary">info</mat-icon>
                <span>Accepting this request will decrease your available project capacity by 1.</span>
            </div>
            <mat-form-field appearance="outline" class="full-width mt-3">
                <mat-label>Optional Welcome Message</mat-label>
                <textarea matInput [(ngModel)]="feedback" rows="4" placeholder="e.g., Looking forward to working with your team!"></textarea>
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="primary" (click)="onConfirm()">Accept Request</button>
        </mat-dialog-actions>
    `,
    styles: [`
        .full-width {
            width: 100%;
        }
        mat-dialog-content {
            padding: 20px 24px;
        }
        p {
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .capacity-warning {
            display: flex;
            align-items: center;
            gap: 12px;
            background: #f0f7ff;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: #1e40af;
        }
        .mt-3 {
            margin-top: 12px;
        }
    `]
})
export class AcceptDialogComponent {
    feedback = '';

    constructor(
        public dialogRef: MatDialogRef<AcceptDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { request: MentorRequest }
    ) { }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close({ feedback: this.feedback });
    }
}

// Reject Dialog Component
@Component({
    selector: 'app-reject-dialog',
    template: `
        <h2 mat-dialog-title>Reject Mentor Request</h2>
        <mat-dialog-content>
            <p>Please provide a reason for rejecting the mentor request from <strong>{{data.request.teamName}}</strong>.</p>
            <mat-form-field appearance="outline" class="full-width">
                <mat-label>Rejection Reason *</mat-label>
                <textarea matInput [(ngModel)]="reason" rows="4" required placeholder="e.g., I'm currently at full capacity"></textarea>
                <mat-hint>This will be sent to the team</mat-hint>
            </mat-form-field>
            <p class="error" *ngIf="submitted && !isValid()">Reason is required (minimum 10 characters)</p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="onCancel()">Cancel</button>
            <button mat-raised-button color="warn" (click)="onConfirm()">Reject Request</button>
        </mat-dialog-actions>
    `,
    styles: [`
        .full-width {
            width: 100%;
        }
        mat-dialog-content {
            padding: 20px 24px;
        }
        p {
            margin-bottom: 20px;
            line-height: 1.6;
        }
        .error {
            color: #ff5754;
            font-size: 12px;
            margin-top: 8px;
        }
    `]
})
export class RejectDialogComponent {
    reason = '';
    submitted = false;

    constructor(
        public dialogRef: MatDialogRef<RejectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { request: MentorRequest }
    ) { }

    isValid(): boolean {
        return this.reason.trim().length >= 10;
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.submitted = true;
        if (this.isValid()) {
            this.dialogRef.close({ reason: this.reason });
        }
    }
}
