import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { CreateTaskRequest } from '../../../core/models/task.model';
import { TeamMember } from '../../../core/models/project.model';

@Component({
    selector: 'app-task-dialog',
    templateUrl: './task-dialog.component.html',
    styleUrls: ['./task-dialog.component.scss']
})
export class TaskDialogComponent implements OnInit {
    taskForm!: FormGroup;
    teamMembers: TeamMember[] = [];
    isSubmitting = false;

    priorities = [
        { value: 'LOW', label: 'Low', color: 'gray' },
        { value: 'MEDIUM', label: 'Medium', color: 'blue' },
        { value: 'HIGH', label: 'High', color: 'orange' },
        { value: 'URGENT', label: 'Urgent', color: 'red' }
    ];

    popularTags = [
        'frontend', 'backend', 'API', 'database', 'testing',
        'UI', 'bug', 'feature', 'devops', 'documentation'
    ];

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private teamService: TeamService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TaskDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { projectId: number; sprintId?: number; teamId?: number }
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadTeamMembers();
    }

    initForm(): void {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            priority: ['MEDIUM', Validators.required],
            assignedTo: [null],
            dueDate: [null],
            tags: [[]],
            estimatedHours: [null, [Validators.min(0.5), Validators.max(100)]]
        });
    }

    loadTeamMembers(): void {
        if (this.data.teamId) {
            this.teamService.getTeamById(this.data.teamId).subscribe({
                next: (team) => {
                    this.teamMembers = team.members;
                },
                error: () => {
                    console.error('Error loading team members');
                }
            });
        }
    }

    addTag(tag: string): void {
        const currentTags = this.taskForm.get('tags')?.value || [];
        if (!currentTags.includes(tag)) {
            this.taskForm.patchValue({ tags: [...currentTags, tag] });
        }
    }

    removeTag(tag: string): void {
        const currentTags = this.taskForm.get('tags')?.value || [];
        this.taskForm.patchValue({
            tags: currentTags.filter((t: string) => t !== tag)
        });
    }

    onSubmit(): void {
        if (this.taskForm.invalid) {
            this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.isSubmitting = true;
        const request: CreateTaskRequest = {
            projectId: this.data.projectId,
            sprintId: this.data.sprintId,
            teamId: this.data.teamId,
            ...this.taskForm.value
        };

        this.taskService.createTask(request).subscribe({
            next: (task) => {
                this.snackBar.open('Task created successfully!', 'Close', { duration: 3000 });
                this.dialogRef.close(task);
            },
            error: (error) => {
                const message = error?.error?.message || 'Error creating task';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.isSubmitting = false;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
