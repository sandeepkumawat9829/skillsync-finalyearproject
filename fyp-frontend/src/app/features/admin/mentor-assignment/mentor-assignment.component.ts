import { Component, OnInit } from '@angular/core';
import { AdminService, TeamWithoutMentor, ForceAssignResponse } from '../../../core/services/admin.service';
import { MentorService } from '../../../core/services/mentor.service';
import { Mentor } from '../../../core/models/mentor.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-mentor-assignment',
    templateUrl: './mentor-assignment.component.html',
    styleUrls: ['./mentor-assignment.component.scss']
})
export class MentorAssignmentComponent implements OnInit {
    teamsWithoutMentor: TeamWithoutMentor[] = [];
    availableMentors: Mentor[] = [];
    loading = false;
    assigning = false;

    selectedTeamId: number | null = null;
    selectedMentorId: number | null = null;

    displayedColumns: string[] = ['teamName', 'projectTitle', 'teamLeader', 'members', 'status', 'actions'];

    constructor(
        private adminService: AdminService,
        private mentorService: MentorService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;

        // Load teams without mentor
        this.adminService.getTeamsWithoutMentor().subscribe({
            next: (teams) => {
                this.teamsWithoutMentor = teams;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading teams:', err);
                this.snackBar.open('Failed to load teams', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });

        // Load available mentors
        this.mentorService.getAvailableMentors().subscribe({
            next: (mentors) => {
                this.availableMentors = mentors;
            },
            error: (err) => {
                console.error('Error loading mentors:', err);
            }
        });
    }

    openAssignDialog(team: TeamWithoutMentor): void {
        this.selectedTeamId = team.teamId;
        this.selectedMentorId = null;
    }

    closeDialog(): void {
        this.selectedTeamId = null;
        this.selectedMentorId = null;
    }

    assignMentor(): void {
        if (!this.selectedTeamId || !this.selectedMentorId) {
            this.snackBar.open('Please select a mentor', 'Close', { duration: 3000 });
            return;
        }

        this.assigning = true;
        this.adminService.forceAssignMentor(this.selectedTeamId, this.selectedMentorId).subscribe({
            next: (response: ForceAssignResponse) => {
                this.snackBar.open(response.message, 'Close', { duration: 3000 });
                this.closeDialog();
                this.loadData(); // Refresh the list
                this.assigning = false;
            },
            error: (err) => {
                console.error('Error assigning mentor:', err);
                this.snackBar.open('Failed to assign mentor: ' + (err.error?.message || err.message), 'Close', { duration: 5000 });
                this.assigning = false;
            }
        });
    }

    getSelectedTeam(): TeamWithoutMentor | undefined {
        return this.teamsWithoutMentor.find(t => t.teamId === this.selectedTeamId);
    }
}
