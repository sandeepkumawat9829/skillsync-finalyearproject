import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { TeamService } from '../../../core/services/team.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';
import { User } from '../../../core/models/user.model';
import { Project } from '../../../core/models/project.model';
import { Notification } from '../../../core/models/notification.model';

@Component({
    selector: 'app-student-dashboard',
    templateUrl: './student-dashboard.component.html',
    styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
    currentUser: User | null = null;
    loading = true;

    myProjects: Project[] = [];
    notifications: Notification[] = [];
    unreadCount = 0;
    
    // Error states
    errors = {
        projects: false,
        teams: false,
        invitations: false,
        notifications: false,
        tasks: false
    };

    stats = {
        projects: 0,
        teams: 0,
        pendingInvites: 0,
        tasksDue: 0
    };

    constructor(
        private authService: AuthService,
        private projectService: ProjectService,
        private teamService: TeamService,
        private notificationService: NotificationService,
        private taskService: TaskService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading = true;

        forkJoin({
            projects: this.projectService.getMyProjects().pipe(catchError(() => { this.errors.projects = true; return of([]); })),
            invitations: this.teamService.getMyInvitations().pipe(catchError(() => { this.errors.invitations = true; return of([]); })),
            notifications: this.notificationService.getMyNotifications().pipe(catchError(() => { this.errors.notifications = true; return of([]); })),
            tasks: this.taskService.getMyTasks().pipe(catchError(() => { this.errors.tasks = true; return of([]); }))
        }).subscribe({
            next: (data) => {
                this.myProjects = data.projects;
                this.stats.projects = data.projects.length;

                const pendingInvites = data.invitations.filter(inv => inv.status === 'PENDING');
                this.stats.pendingInvites = pendingInvites.length;

                this.notifications = data.notifications.slice(0, 5);
                this.unreadCount = data.notifications.filter(n => !n.isRead).length;

                const activeTasks = data.tasks.filter(t => t.status !== 'DONE');
                this.stats.tasksDue = activeTasks.length;

                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        this.teamService.getMyTeamsList().pipe(
            catchError(() => { this.errors.teams = true; return of([]); })
        ).subscribe({
            next: (teams) => {
                this.stats.teams = teams.length;
            }
        });
    }

    getNotificationIcon(type: string): string {
        const iconMap: Record<string, string> = {
            'TEAM_INVITE': 'group_add',
            'TASK_ASSIGNED': 'assignment',
            'MENTOR_RESPONSE': 'school',
            'PROJECT_UPDATE': 'update',
            'SYSTEM': 'info'
        };
        return iconMap[type] || 'notifications';
    }

    getNotificationClass(type: string): string {
        const classMap: Record<string, string> = {
            'TEAM_INVITE': 'team-notification',
            'TASK_ASSIGNED': 'task-notification',
            'MENTOR_RESPONSE': 'mentor-notification',
            'PROJECT_UPDATE': 'project-notification',
            'SYSTEM': 'system-notification'
        };
        return classMap[type] || '';
    }
}
