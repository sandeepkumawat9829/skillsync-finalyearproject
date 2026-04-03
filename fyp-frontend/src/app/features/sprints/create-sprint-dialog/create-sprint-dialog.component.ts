import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SprintService } from '../../../core/services/sprint.service';
import { CreateSprintRequest } from '../../../core/models/sprint.model';

@Component({
    selector: 'app-create-sprint-dialog',
    templateUrl: './create-sprint-dialog.component.html',
    styleUrls: ['./create-sprint-dialog.component.scss']
})
export class CreateSprintDialogComponent {
    sprintName = '';
    sprintGoal = '';
    startDate: Date | null = null;
    durationWeeks = 2;

    minDate = new Date(new Date().setHours(0, 0, 0, 0));
    durations = [
        { value: 1, label: '1 Week' },
        { value: 2, label: '2 Weeks' },
        { value: 3, label: '3 Weeks' },
        { value: 4, label: '4 Weeks' }
    ];

    saving = false;

    constructor(
        private dialogRef: MatDialogRef<CreateSprintDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { projectId: number },
        private sprintService: SprintService,
        private snackBar: MatSnackBar
    ) {
        // Auto-generate sprint name
        this.sprintService.getSprintsByProject(data.projectId).subscribe(sprints => {
            const nextNumber = sprints.length + 1;
            this.sprintName = `Sprint ${nextNumber}`;
        });
    }

    get endDate(): Date | null {
        if (!this.startDate) return null;
        const end = new Date(this.startDate);
        end.setDate(end.getDate() + (this.durationWeeks * 7));
        return end;
    }

    get isValid(): boolean {
        return this.sprintName.trim().length > 0 &&
            this.sprintGoal.trim().length >= 10 &&
            this.startDate != null;
    }

    createSprint(): void {
        if (!this.isValid || !this.startDate) return;

        // Normalize dates to noon to prevent timezone serialization shifting the day
        const normalizedStart = new Date(this.startDate);
        normalizedStart.setHours(12, 0, 0, 0);

        const normalizedEnd = new Date(this.endDate!);
        normalizedEnd.setHours(12, 0, 0, 0);

        const request: CreateSprintRequest = {
            projectId: this.data.projectId,
            sprintName: this.sprintName.trim(),
            sprintGoal: this.sprintGoal.trim(),
            startDate: normalizedStart,
            endDate: normalizedEnd
        };

        this.saving = true;

        this.sprintService.createSprint(request).subscribe({
            next: (sprint) => {
                this.snackBar.open(`${sprint.sprintName} created successfully!`, 'Close', { duration: 3000 });
                this.dialogRef.close(sprint);
            },
            error: (error) => {
                const message = error?.error?.message
                    || (error?.error?.validationErrors
                        ? Object.values(error.error.validationErrors).join(', ')
                        : null)
                    || error?.message
                    || 'Error creating sprint';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.saving = false;
            }
        });
    }

    cancel(): void {
        this.dialogRef.close();
    }

    formatDate(date: Date | null): string {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }
}
