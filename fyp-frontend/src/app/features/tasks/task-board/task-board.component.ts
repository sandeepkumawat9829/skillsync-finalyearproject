import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Subject, takeUntil } from 'rxjs';
import { Project, Team } from '../../../core/models/project.model';
import { ReorderTaskRequest, Task, TaskColumn, TaskBoardEvent } from '../../../core/models/task.model';
import { Sprint, CreateSprintRequest } from '../../../core/models/sprint.model';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { TeamService } from '../../../core/services/team.service';
import { SprintService } from '../../../core/services/sprint.service';
import { TaskDialogComponent } from '../task-dialog/task-dialog.component';
import { ConfirmDialogComponent } from '../../sprints/confirm-dialog/confirm-dialog.component';

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

    // Sprint management
    sprints: Sprint[] = [];
    activeSprint: Sprint | null = null;
    showSprintCreate = false;
    isCreatingSprint = false;
    newSprint: Partial<CreateSprintRequest> = {};

    // Permission flags
    isLeaderOrMentor = false;
    currentUserId = 0;

    // Column order for backward-move detection
    private readonly COLUMN_ORDER: Record<string, number> = {
        'TODO': 0,
        'IN_PROGRESS': 1,
        'IN_REVIEW': 2,
        'DONE': 3
    };

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
        private sprintService: SprintService,
        private authService: AuthService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        const currentUser = this.authService.currentUserValue;
        this.currentUserId = currentUser?.userId || 0;

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
                this.loadSprints();
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
            next: (data: any) => {
                this.project = data;
            },
            error: (error: any) => {
                const message = error?.error?.message || 'Error loading project';
                this.snackBar.open(message, 'Close', { duration: 3000 });
            }
        });
    }

    loadTeam(): void {
        this.teamService.getTeamByProject(this.projectId).subscribe({
            next: (team: any) => {
                this.team = team;
                this.resolvePermissions();
            },
            error: () => {
                this.team = null;
                this.resolvePermissions();
            }
        });
    }

    loadSprints(): void {
        this.sprintService.getSprintsByProject(this.projectId).subscribe({
            next: (sprints: Sprint[]) => {
                this.sprints = sprints;
                // Find active sprint or use the first one
                this.activeSprint = sprints.find(s => s.status === 'ACTIVE') || null;

                if (this.sprintId) {
                    // Use URL param sprint
                    this.loadTasks();
                } else if (this.activeSprint) {
                    // Auto-select active sprint
                    this.sprintId = this.activeSprint.sprintId;
                    this.loadTasks();
                } else if (sprints.length > 0) {
                    // Use latest sprint
                    this.sprintId = sprints[0].sprintId;
                    this.loadTasks();
                } else {
                    // No sprints — show create sprint prompt
                    this.loading = false;
                }
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    loadTasks(): void {
        this.loading = true;
        const taskRequest = this.sprintId
            ? this.taskService.getTasksBySprint(this.sprintId)
            : this.taskService.getTasksByProject(this.projectId);

        taskRequest.subscribe({
            next: (tasks: any) => {
                this.organizeTasks(tasks);
                this.loading = false;
            },
            error: (error: any) => {
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
        const movedTask = event.previousContainer.data[event.previousIndex];
        const oldColumnId = movedTask.status;
        const newColumnId = targetColumn.id;

        // Check backward movement for regular members
        if (!this.isLeaderOrMentor && event.previousContainer !== event.container) {
            const oldOrder = this.COLUMN_ORDER[oldColumnId] ?? 0;
            const newOrder = this.COLUMN_ORDER[newColumnId] ?? 0;
            if (newOrder < oldOrder) {
                this.snackBar.open('Only the team leader or mentor can revert task progress', 'Close', { duration: 3000 });
                return;
            }
        }

        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            const task = event.container.data[event.currentIndex];
            task.status = targetColumn.id as Task['status'];
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
        if (!this.sprintId) {
            this.snackBar.open('Please create a sprint first before adding tasks', 'Close', { duration: 3000 });
            return;
        }

        const dialogRef = this.dialog.open(TaskDialogComponent, {
            width: '600px',
            data: {
                projectId: this.projectId,
                sprintId: this.sprintId,
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

    // Sprint creation


    goToSprints(): void {
        const role = this.authService.currentUserValue?.role;
        if (role === 'MENTOR') {
            this.router.navigate(['/mentor/teams']);
            this.snackBar.open('Please manage sprints from the team view', 'Close', { duration: 3000 });
        } else {
            this.router.navigate(['/student/sprints']);
        }
    }

    selectSprint(sprintId: number): void {
        this.sprintId = sprintId;
        this.loadTasks();
    }

    goToAnalytics(): void {
        this.router.navigate([this.getAnalyticsRoute()], {
            queryParams: { projectId: this.projectId }
        });
    }

    getSprintCompletionWarning(): string | null {
        if (!this.activeSprint || this.sprintId != this.activeSprint.sprintId) {
            return null; // Not viewing the active sprint, so button shouldn't even show
        }
        
        // Backend requires at least one task overall...
        const totalTasks = this.columns.reduce((sum, col) => sum + col.tasks.length, 0);
        if (totalTasks === 0) return 'Sprint must have at least one task before completing.';

        // ...and at least one DONE task
        const doneColumn = this.columns.find(c => c.id === 'DONE');
        if (!doneColumn || doneColumn.tasks.length === 0) {
            return 'At least one task must be in the Done column.';
        }

        return null; // Can complete!
    }

    completeCurrentSprint(): void {
        if (!this.activeSprint) return;
        
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '440px',
            data: {
                title: 'Complete Sprint',
                message: `Are you sure you want to complete "${this.activeSprint.sprintName}"? Incomplete tasks will remain in their columns.`,
                confirmText: 'Complete',
                cancelText: 'Cancel',
                color: 'accent',
                icon: 'check_circle'
            }
        });

        dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
                this.sprintService.completeSprint(this.activeSprint!.sprintId).subscribe({
                    next: () => {
                        this.snackBar.open('Sprint completed successfully!', 'Close', { duration: 3000 });
                        this.loadSprints(); // This will refresh and select the next available sprint
                    },
                    error: (error) => {
                        const message = error?.error?.message || 'Error completing sprint';
                        this.snackBar.open(message, 'Close', { duration: 4000 });
                    }
                });
            }
        });
    }

    canStartCurrentSprint(): boolean {
        if (!this.isLeaderOrMentor || !this.sprintId) return false;
        const currentSprint = this.sprints.find(s => s.sprintId == this.sprintId);
        if (!currentSprint || currentSprint.status !== 'PLANNED') return false;
        return !this.activeSprint; // Can only start if there is no active sprint
    }

    startCurrentSprint(): void {
        if (!this.sprintId) return;
        this.sprintService.startSprint(this.sprintId).subscribe({
            next: (sprint: Sprint) => {
                this.snackBar.open('Sprint started successfully!', 'Close', { duration: 3000 });
                this.loadSprints(); // Refresh to set as active sprint
            },
            error: (error) => {
                const message = error?.error?.message || 'Error starting sprint';
                this.snackBar.open(message, 'Close', { duration: 4000 });
            }
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

    private resolvePermissions(): void {
        const currentUser = this.authService.currentUserValue;
        if (!currentUser) {
            this.isLeaderOrMentor = false;
            return;
        }

        // Mentor always has full access
        if (currentUser.role === 'MENTOR') {
            this.isLeaderOrMentor = true;
            return;
        }

        // Team leader has full access
        if (this.team && this.team.teamLeaderId === currentUser.userId) {
            this.isLeaderOrMentor = true;
            return;
        }

        this.isLeaderOrMentor = false;
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
