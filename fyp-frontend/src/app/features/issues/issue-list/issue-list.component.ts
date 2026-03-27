import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IssueService } from '../../../core/services/issue.service';
import { Issue } from '../../../core/models/issue.model';
import { CreateIssueDialogComponent } from '../create-issue-dialog/create-issue-dialog.component';

@Component({
    selector: 'app-issue-list',
    templateUrl: './issue-list.component.html',
    styleUrls: ['./issue-list.component.scss']
})
export class IssueListComponent implements OnInit {
    projectId!: number;
    issues: Issue[] = [];
    filteredIssues: Issue[] = [];
    loading = false;

    // Filters
    selectedType: string = 'ALL';
    selectedStatus: string = 'ALL';
    selectedPriority: string = 'ALL';

    issueTypes = ['ALL', 'BUG', 'FEATURE', 'ENHANCEMENT', 'QUESTION'];
    issueStatuses = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    issuePriorities = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    constructor(
        private route: ActivatedRoute,
        private issueService: IssueService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.projectId = +params['id'];
            this.loadIssues();
        });
    }

    loadIssues(): void {
        this.loading = true;
        this.issueService.getIssuesByProject(this.projectId).subscribe({
            next: (issues) => {
                this.issues = issues;
                this.applyFilters();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Failed to load issues', 'Close', { duration: 3000 });
            }
        });
    }

    applyFilters(): void {
        this.filteredIssues = this.issues.filter(issue => {
            const typeMatch = this.selectedType === 'ALL' || issue.issueType === this.selectedType;
            const statusMatch = this.selectedStatus === 'ALL' || issue.status === this.selectedStatus;
            const priorityMatch = this.selectedPriority === 'ALL' || issue.priority === this.selectedPriority;
            return typeMatch && statusMatch && priorityMatch;
        });
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    getTypeIcon(type: string): string {
        const icons: any = {
            'BUG': 'bug_report',
            'FEATURE': 'lightbulb',
            'ENHANCEMENT': 'auto_fix_high',
            'QUESTION': 'help'
        };
        return icons[type] || 'label';
    }

    getTypeColor(type: string): string {
        const colors: any = {
            'BUG': 'type-bug',
            'FEATURE': 'type-feature',
            'ENHANCEMENT': 'type-enhancement',
            'QUESTION': 'type-question'
        };
        return colors[type] || '';
    }

    getPriorityColor(priority: string): string {
        const colors: any = {
            'CRITICAL': 'priority-critical',
            'HIGH': 'priority-high',
            'MEDIUM': 'priority-medium',
            'LOW': 'priority-low'
        };
        return colors[priority] || '';
    }

    getStatusColor(status: string): string {
        const colors: any = {
            'OPEN': 'status-open',
            'IN_PROGRESS': 'status-progress',
            'RESOLVED': 'status-resolved',
            'CLOSED': 'status-closed'
        };
        return colors[status] || '';
    }

    createIssue(): void {
        const dialogRef = this.dialog.open(CreateIssueDialogComponent, {
            width: '600px',
            data: { projectId: this.projectId }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.snackBar.open('Issue created successfully!', 'Close', { duration: 3000 });
                this.loadIssues();
            }
        });
    }

    viewIssue(issueId: number): void {
        // Navigate to issue detail
        // this.router.navigate([`/student/projects/${this.projectId}/issues/${issueId}`]);
        this.snackBar.open(`View issue #${issueId} - Detail page coming soon!`, 'Close', { duration: 2000 });
    }
}
