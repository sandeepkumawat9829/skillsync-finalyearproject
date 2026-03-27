import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { Project, Team } from '../../../core/models/project.model';
import { ReorderTaskRequest, Task, TaskColumn, TaskBoardEvent } from '../../../core/models/task.model';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';

@Component({
    selector: 'app-task-board',
    templateUrl: './task-board.component.html',
    styleUrls: ['./task-board.component.scss']
})
export class TaskBoardComponent implements OnInit, OnDestroy {
    project: Project | null = null;
    team: Team | null = null;
    projectId!: number;
    sprintId: number | null = null;
    loading = true;
    private subscribedProjectId: number | null = null;

    private destroy$ = new Subject<void>();

    columns: TaskColumn[] = [
        { id: 'TODO', title: 'To Do', tasks: [] },
        { id: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
        { id: 'IN_REVIEW', title: 'In Review', tasks: [] },
        { id: 'DONE', title: 'Done', tasks: [] }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private taskService: TaskService,
        private projectService: ProjectService,
        private teamService: TeamService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const nextProjectId = +params['projectId'];
                if (!nextProjectId || Number.isNaN(nextProjectId)) {
                    this.loading = false;
                    this.snackBar.open('Please select a project to view tasks', 'Close', { duration: 3000 });
                    return;
                }

                if (this.projectId && this.projectId !== nextProjectId) {
                    this.taskService.unsubscribeFromProject(this.projectId);
                }

                this.projectId = nextProjectId;
                this.sprintId = params['sprintId'] ? +params['sprintId'] : null;
                this.subscribeToBoardEvents();
                this.loadProject();
                this.loadTeam();
                this.loadTasks();
            });
    }

    ngOnDestroy(): void {
        if (this.projectId) {
            this.taskService.unsubscribeFromProject(this.projectId);
        }
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadProject(): void {
        this.projectService.getProjectById(this.projectId).subscribe({
            next: (data) => {
                this.project = data;
            },
            error: (error) => {
                const message = error?.error?.message || 'Error loading project';
                this.snackBar.open(message, 'Close', { duration: 3000 });
            }
        });
    }

    loadTeam(): void {
        this.teamService.getTeamByProject(this.projectId).subscribe({
            next: (team) => {
                this.team = team;
            },
            error: () => {
                this.team = null;
            }
        });
    }

    loadTasks(): void {
        this.loading = true;
        const taskRequest = this.sprintId
            ? this.taskService.getTasksBySprint(this.sprintId)
            : this.taskService.getTasksByProject(this.projectId);

        taskRequest.subscribe({
            next: (tasks) => {
                this.organizeTasks(tasks);
                this.loading = false;
            },
            error: (error) => {
                const message = error?.error?.message || 'Error loading tasks';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    organizeTasks(tasks: Task[]): void {
        this.columns.forEach(column => {
            column.tasks = [];
        });

        tasks
            .sort((left, right) => (left.position ?? 0) - (right.position ?? 0))
            .forEach(task => {
                const column = this.columns.find(item => item.id === task.status);
                if (column) {
                    column.tasks.push(task);
                }
            });

        this.syncColumnPositions();
    }

    onDrop(event: CdkDragDrop<Task[]>, targetColumn: TaskColumn): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            const movedTask = event.container.data[event.currentIndex];
            movedTask.status = targetColumn.id as Task['status'];
        }

        this.syncColumnPositions();
        const updates = this.buildReorderPayload();

        this.taskService.reorderTasks(this.projectId, updates).subscribe({
            next: () => {
                this.snackBar.open('Task board updated', 'Close', { duration: 1500 });
            },
            error: () => {
                this.snackBar.open('Error updating task board', 'Close', { duration: 3000 });
                this.loadTasks();
            }
        });
    }

    createTask(): void {
        const dialogRef = this.dialog.open(TaskDialogComponent, {
            width: '600px',
            data: {
                projectId: this.projectId,
                sprintId: this.sprintId ?? undefined,
                teamId: this.team?.teamId
            }
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                if (result) {
                    this.loadTasks();
                }
            });
    }

    goToAnalytics(): void {
        this.router.navigate([this.getAnalyticsRoute()], {
            queryParams: { projectId: this.projectId }
        });
    }

    goBack(): void {
        this.router.navigate([this.getProjectsRoute()]);
    }

    getColumnClass(columnId: string): string {
        const classes: Record<string, string> = {
            TODO: 'todo-column',
            IN_PROGRESS: 'progress-column',
            IN_REVIEW: 'review-column',
            DONE: 'done-column'
        };
        return classes[columnId] || '';
    }

    getPriorityColor(priority: string): string {
        const colors: Record<string, string> = {
            LOW: 'gray',
            MEDIUM: 'blue',
            HIGH: 'orange',
            URGENT: 'red'
        };
        return colors[priority] || 'gray';
    }

    isOverdue(task: Task): boolean {
        if (!task.dueDate || task.status === 'DONE') {
            return false;
        }
        return new Date(task.dueDate) < new Date();
    }

    get connectedDropLists(): string[] {
        return this.columns.map(column => column.id);
    }

    private syncColumnPositions(): void {
        this.columns.forEach(column => {
            column.tasks.forEach((task, index) => {
                task.status = column.id as Task['status'];
                task.position = index;
            });
        });
    }

    private buildReorderPayload(): ReorderTaskRequest[] {
        return this.columns.flatMap(column =>
            column.tasks.map((task, index) => ({
                taskId: task.taskId,
                status: column.id as Task['status'],
                position: index
            }))
        );
    }

    private subscribeToBoardEvents(): void {
        if (this.subscribedProjectId === this.projectId) {
            return;
        }
        this.subscribedProjectId = this.projectId;
        this.taskService.subscribeToProject(this.projectId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((event: TaskBoardEvent) => {
                if (event?.eventType) {
                    this.loadTasks();
                }
            });
    }

    private getProjectsRoute(): string {
        return this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/teams'
            : '/student/projects';
    }

    private getAnalyticsRoute(): string {
        return this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/task-workspace/analytics'
            : '/student/tasks/analytics';
    }
}
