import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from '../../../core/services/meeting.service';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateMeetingRequest } from '../../../core/models/meeting.model';

@Component({
    selector: 'app-meeting-create',
    templateUrl: './meeting-create.component.html',
    styleUrls: ['./meeting-create.component.scss']
})
export class MeetingCreateComponent implements OnInit {
    meetingForm!: FormGroup;
    loading = false;
    submitting = false;

    teams: any[] = [];
    meetingTypes = [
        { value: 'ONLINE', label: 'Online', icon: 'videocam' },
        { value: 'OFFLINE', label: 'Offline', icon: 'place' }
    ];

    durations = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' }
    ];

    minDate = new Date();

    constructor(
        private fb: FormBuilder,
        private meetingService: MeetingService,
        private teamService: TeamService,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadTeams();
    }

    initForm(): void {
        this.meetingForm = this.fb.group({
            teamId: ['', Validators.required],
            title: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            meetingType: ['ONLINE', Validators.required],
            scheduledDate: ['', Validators.required],
            scheduledTime: ['', Validators.required],
            durationMinutes: [60, Validators.required],
            location: [''],
            meetingLink: ['']
        });

        // Watch meeting type to show/hide location/link fields
        this.meetingForm.get('meetingType')?.valueChanges.subscribe((type) => {
            const locationControl = this.meetingForm.get('location');
            const linkControl = this.meetingForm.get('meetingLink');

            if (type === 'ONLINE') {
                locationControl?.clearValidators();
                linkControl?.setValidators([Validators.required]);
            } else {
                linkControl?.clearValidators();
                locationControl?.setValidators([Validators.required]);
            }

            locationControl?.updateValueAndValidity();
            linkControl?.updateValueAndValidity();
        });
    }

    loadTeams(): void {
        this.loading = true;
        this.teamService.getMyTeamsList().subscribe({
            next: (data) => {
                this.teams = data;
                this.loading = false;
                
                // Pre-select if only one team
                if (this.teams.length === 1) {
                    this.meetingForm.patchValue({ teamId: this.teams[0].teamId });
                }
            },
            error: () => {
                this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    get selectedTeam(): any {
        const teamId = this.meetingForm.get('teamId')?.value;
        return this.teams.find(t => t.teamId === teamId);
    }

    scheduleMeeting(): void {
        if (this.meetingForm.invalid) {
            this.meetingForm.markAllAsTouched();
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.submitting = true;

        const formValue = this.meetingForm.value;

        // Combine date and time
        const scheduledDate = new Date(formValue.scheduledDate);
        const [hours, minutes] = formValue.scheduledTime.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes));

        const user = this.authService.currentUserValue;
        const role = user?.role;

        const request: CreateMeetingRequest = {
            teamId: formValue.teamId,
            title: formValue.title,
            description: formValue.description,
            meetingType: formValue.meetingType,
            scheduledAt: scheduledDate,
            durationMinutes: formValue.durationMinutes,
            location: formValue.location || undefined,
            meetingLink: formValue.meetingLink || undefined
        };

        // Set mentorId based on role
        if (role === 'MENTOR') {
            request.mentorId = user?.userId;
        } else if (role === 'STUDENT') {
            const team = this.selectedTeam;
            if (team?.mentorId) {
                request.mentorId = team.mentorId;
            }
        }

        this.meetingService.createMeeting(request).subscribe({
            next: (meeting) => {
                this.snackBar.open('Meeting scheduled successfully!', 'Close', { duration: 3000 });
                const baseRoute = role === 'MENTOR' ? '/mentor' : '/student';
                this.router.navigate([`${baseRoute}/meetings`, meeting.id]);
            },
            error: () => {
                this.snackBar.open('Error scheduling meeting', 'Close', { duration: 3000 });
                this.submitting = false;
            }
        });
    }

    cancel(): void {
        const role = this.authService.getUserRole();
        const baseRoute = role === 'MENTOR' ? '/mentor' : '/student';
        this.router.navigate([`${baseRoute}/meetings`]);
    }

    get isOnlineMeeting(): boolean {
        return this.meetingForm.get('meetingType')?.value === 'ONLINE';
    }
}
