import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { MeetingService } from '../../../core/services/meeting.service';
import { AuthService } from '../../../core/services/auth.service';
import { Meeting } from '../../../core/models/meeting.model';

@Component({
    selector: 'app-meeting-list',
    templateUrl: './meeting-list.component.html',
    styleUrls: ['./meeting-list.component.scss']
})
export class MeetingListComponent implements OnInit {
    loading = false;
    selectedTab = 0; // 0 = Upcoming, 1 = Past

    upcomingMeetings: Meeting[] = [];
    pastMeetings: Meeting[] = [];

    constructor(
        private meetingService: MeetingService,
        private authService: AuthService,
        private router: Router,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadMeetings();
    }

    loadMeetings(): void {
        this.loading = true;
        forkJoin({
            upcomingMeetings: this.meetingService.getUpcomingMeetings(),
            pastMeetings: this.meetingService.getPastMeetings()
        }).subscribe({
            next: ({ upcomingMeetings, pastMeetings }) => {
                this.upcomingMeetings = upcomingMeetings;
                this.pastMeetings = pastMeetings;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Error loading meetings', 'Close', { duration: 3000 });
            }
        });
    }

    viewMeeting(meetingId: number): void {
        const role = this.authService.getUserRole();
        const baseRoute = role === 'MENTOR' ? '/mentor' : '/student';
        this.router.navigate([`${baseRoute}/meetings`, meetingId]);
    }

    createMeeting(): void {
        const role = this.authService.getUserRole();
        const baseRoute = role === 'MENTOR' ? '/mentor' : '/student';
        this.router.navigate([`${baseRoute}/meetings/create`]);
    }

    get isStudent(): boolean {
        return this.authService.getUserRole() === 'STUDENT';
    }

    cancelMeeting(meeting: Meeting, event: Event): void {
        event.stopPropagation();

        if (confirm(`Are you sure you want to cancel "${meeting.title}"?`)) {
            this.meetingService.cancelMeeting(meeting.id).subscribe({
                next: () => {
                    this.snackBar.open('Meeting cancelled successfully', 'Close', { duration: 3000 });
                    this.loadMeetings();
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

    getMeetingTypeColor(type?: string): string {
        switch (type) {
            case 'ONLINE': return 'primary';
            case 'OFFLINE': return 'accent';
            case 'REVIEW': return 'warn';
            case 'DISCUSSION': return 'primary';
            case 'PRESENTATION': return 'accent';
            default: return 'primary';
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'SCHEDULED': return 'primary';
            case 'COMPLETED': return 'accent';
            case 'CANCELLED': return 'warn';
            default: return 'primary';
        }
    }

    isUpcoming(meeting: Meeting): boolean {
        return new Date(meeting.scheduledAt) > new Date() && meeting.status === 'SCHEDULED';
    }

    joinMeeting(meeting: Meeting, event: Event): void {
        event.stopPropagation();
        if (meeting.meetingLink) {
            window.open(meeting.meetingLink, '_blank');
        } else {
            this.snackBar.open('No meeting link available', 'Close', { duration: 3000 });
        }
    }
}
