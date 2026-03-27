import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IssueService } from '../../../core/services/issue.service';
import { CreateIssueRequest } from '../../../core/models/issue.model';

@Component({
    selector: 'app-create-issue-dialog',
    templateUrl: './create-issue-dialog.component.html',
    styleUrls: ['./create-issue-dialog.component.scss']
})
export class CreateIssueDialogComponent {
    issueForm: FormGroup;
    loading = false;

    issueTypes = [
        { value: 'BUG', label: 'Bug', icon: 'bug_report', color: '#d73a4a' },
        { value: 'FEATURE', label: 'Feature Request', icon: 'lightbulb', color: '#0366d6' },
        { value: 'ENHANCEMENT', label: 'Enhancement', icon: 'auto_fix_high', color: '#10b981' },
        { value: 'QUESTION', label: 'Question', icon: 'help', color: '#8b5cf6' }
    ];

    priorities = [
        { value: 'LOW', label: 'Low', color: '#6b7280' },
        { value: 'MEDIUM', label: 'Medium', color: '#3b82f6' },
        { value: 'HIGH', label: 'High', color: '#f59e0b' },
        { value: 'CRITICAL', label: 'Critical', color: '#dc2626' }
    ];

    teamMembers = [
        { userId: 2, name: 'Priya Singh' },
        { userId: 3, name: 'Raj Kumar' },
        { userId: 4, name: 'Amit Patel' }
    ];

    constructor(
        private fb: FormBuilder,
        private issueService: IssueService,
        public dialogRef: MatDialogRef<CreateIssueDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
    ) {
        this.issueForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(10)]],
            description: ['', [Validators.required, Validators.minLength(20)]],
            issueType: ['BUG', Validators.required],
            priority: ['MEDIUM', Validators.required],
            assignedTo: [null]
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        if (this.issueForm.valid) {
            this.loading = true;
            const request: CreateIssueRequest = {
                projectId: this.data.projectId,
                title: this.issueForm.value.title,
                description: this.issueForm.value.description,
                issueType: this.issueForm.value.issueType,
                priority: this.issueForm.value.priority,
                assignedTo: this.issueForm.value.assignedTo
            };

            this.issueService.createIssue(request).subscribe({
                next: (issue) => {
                    this.loading = false;
                    this.dialogRef.close(issue);
                },
                error: () => {
                    this.loading = false;
                }
            });
        }
    }

    getSelectedTypeColor(): string {
        const type = this.issueTypes.find(t => t.value === this.issueForm.value.issueType);
        return type?.color || '#666';
    }

    getSelectedPriorityColor(): string {
        const priority = this.priorities.find(p => p.value === this.issueForm.value.priority);
        return priority?.color || '#666';
    }
}
