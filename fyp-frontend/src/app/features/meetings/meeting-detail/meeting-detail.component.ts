import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from '../../../core/services/meeting.service';
import { AuthService } from '../../../core/services/auth.service';
import { Meeting } from '../../../core/models/meeting.model';

@Component({
    selector: 'app-meeting-detail',
    templateUrl: './meeting-detail.component.html',
    styleUrls: ['./meeting-detail.component.scss']
})
export class MeetingDetailComponent implements OnInit {
    meeting: Meeting | null = null;
    loading = true;
    meetingId!: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private meetingService: MeetingService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.meetingId = +params['id'];
            this.loadMeeting();
        });
    }

    loadMeeting(): void {
        this.loading = true;
        this.meetingService.getMeetingById(this.meetingId).subscribe({
            next: (data) => {
                this.meeting = data;
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading meeting details', 'Close', { duration: 3000 });
                this.loading = false;
                this.goBack();
            }
        });
    }

    goBack(): void {
        const role = this.authService.getUserRole();
        const baseRoute = role === 'MENTOR' ? '/mentor' : '/student';
        this.router.navigate([`${baseRoute}/meetings`]);
    }

    get isStudent(): boolean {
        return this.authService.getUserRole() === 'STUDENT';
    }

    joinMeeting(): void {
        if (this.meeting?.meetingLink) {
            window.open(this.meeting.meetingLink, '_blank');
        }
    }

    cancelMeeting(): void {
        if (!this.meeting) return;

        if (confirm(`Are you sure you want to cancel "${this.meeting.title}"?`)) {
            this.meetingService.cancelMeeting(this.meeting.id).subscribe({
                next: () => {
                    this.snackBar.open('Meeting cancelled successfully', 'Close', { duration: 3000 });
                    this.goBack();
                },
                error: () => {
                    this.snackBar.open('Error cancelling meeting', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getMeetingTypeIcon(type?: string): string {
        switch (type) {
            case 'ONLINE': return 'videocam';
            case 'OFFLINE': return 'place';
            case 'REVIEW': return 'rate_review';
            case 'DISCUSSION': return 'forum';
            case 'PRESENTATION': return 'present_to_all';
            default: return 'event';
        }
    }

    isUpcoming(): boolean {
        if (!this.meeting) return false;
        return new Date(this.meeting.scheduledAt) > new Date() && this.meeting.status === 'SCHEDULED';
    }
}
