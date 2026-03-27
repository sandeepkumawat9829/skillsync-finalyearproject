import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeTrackingService } from '../../../core/services/time-tracking.service';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { TimeEntry, LogTimeRequest } from '../../../core/models/time-entry.model';

@Component({
    selector: 'app-time-tracking',
    templateUrl: './time-tracking.component.html',
    styleUrls: ['./time-tracking.component.scss']
})
export class TimeTrackingComponent implements OnInit {
    tasks: Task[] = [];
    recentEntries: TimeEntry[] = [];
    weeklyEntries: TimeEntry[] = [];
    weeklyTotalHours = 0;

    selectedTaskId: number | null = null;
    hours: number = 1;
    selectedDate: Date = new Date();
    description = '';
    todayHours = 0;
    loading = false;

    constructor(
        private timeService: TimeTrackingService,
        private taskService: TaskService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadTasks();
        this.loadTodayHours();
        this.loadRecentEntries();
        this.loadWeeklyReport();
    }

    loadTasks(): void {
        this.taskService.getTasksByProject(1).subscribe({
            next: (data) => {
                this.tasks = data.filter(t => t.status !== 'DONE');
            }
        });
    }

    loadTodayHours(): void {
        this.timeService.getTodayHours(1).subscribe({
            next: (hours) => {
                this.todayHours = hours;
            }
        });
    }

    loadRecentEntries(): void {
        this.timeService.getTimeEntries().subscribe({
            next: (entries) => {
                this.recentEntries = entries.slice(0, 5);
            },
            error: () => {
                // Silently handle error - may have no entries yet
            }
        });
    }

    loadWeeklyReport(): void {
        this.timeService.getWeeklyTimeEntries().subscribe({
            next: (entries) => {
                this.weeklyEntries = entries;
                // Calculate total hours from entries
                this.weeklyTotalHours = entries.reduce((sum, e) => sum + e.hours, 0);
            },
            error: () => {
                // Silently handle error
            }
        });
    }

    logTime(): void {
        if (!this.selectedTaskId || this.hours <= 0) {
            this.snackBar.open('Please select a task and enter hours', 'Close', { duration: 3000 });
            return;
        }

        const request: LogTimeRequest = {
            taskId: this.selectedTaskId,
            hours: this.hours,
            date: this.selectedDate,
            description: this.description.trim()
        };

        this.loading = true;

        this.timeService.logTime(request).subscribe({
            next: () => {
                this.snackBar.open('Time logged successfully!', 'Close', { duration: 2000 });
                this.resetForm();
                this.loadTodayHours();
                this.loadRecentEntries();
                this.loadWeeklyReport();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error logging time', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    deleteEntry(entryId: number): void {
        if (confirm('Delete this time entry?')) {
            this.timeService.deleteTimeEntry(entryId).subscribe({
                next: () => {
                    this.snackBar.open('Entry deleted', 'Close', { duration: 2000 });
                    this.loadTodayHours();
                    this.loadRecentEntries();
                    this.loadWeeklyReport();
                }
            });
        }
    }

    private resetForm(): void {
        this.selectedTaskId = null;
        this.hours = 1;
        this.description = '';
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    formatHours(hours: number): string {
        return this.timeService.formatHours(hours);
    }
}
