import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { AnalyticsService, ProjectAnalytics } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/project.model';
import { AnalyticsOverview, BurndownData, VelocityData, ContributionData, SprintMetrics } from '../../../core/models/analytics.model';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
    selector: 'app-project-analytics',
    templateUrl: './project-analytics.component.html',
    styleUrls: ['./project-analytics.component.scss']
})
export class ProjectAnalyticsComponent implements OnInit, AfterViewInit {
    @ViewChild('burndownCanvas') burndownCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('velocityCanvas') velocityCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('contributionCanvas') contributionCanvas!: ElementRef<HTMLCanvasElement>;

    project: Project | null = null;
    projectId!: number;
    loading = true;

    // Charts
    burndownChart: Chart | null = null;
    velocityChart: Chart | null = null;
    contributionChart: Chart | null = null;

    // Data
    overview: AnalyticsOverview | null = null;
    sprintMetrics: SprintMetrics[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private projectService: ProjectService,
        private analyticsService: AnalyticsService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.projectId = +params['projectId'] || 1; // Default to project 1
            this.loadProject();
            this.loadAnalytics();
        });
    }

    ngAfterViewInit(): void {
        // Charts will be created after data is loaded
    }

    loadProject(): void {
        this.projectService.getProjectById(this.projectId).subscribe({
            next: (data) => {
                this.project = data;
            },
            error: () => {
                console.error('Error loading project');
            }
        });
    }

    loadAnalytics(): void {
        this.loading = true;
        this.analyticsService.getProjectAnalytics(this.projectId).subscribe({
            next: (analytics: ProjectAnalytics) => {
                this.overview = analytics.overview;
                this.sprintMetrics = analytics.sprintMetrics;
                setTimeout(() => {
                    this.createBurndownChart(analytics.burndownData);
                    this.createVelocityChart(analytics.velocityData);
                    this.createContributionChart(analytics.contributionData);
                }, 100);
                this.loading = false;
            },
            error: (error) => {
                this.handleAnalyticsError(error);
            }
        });
    }

    createBurndownChart(data: BurndownData[]): void {
        if (!this.burndownCanvas) return;

        const ctx = this.burndownCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        this.burndownChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => `Day ${i}`),
                datasets: [
                    {
                        label: 'Ideal Burndown',
                        data: data.map(d => d.idealRemaining),
                        borderColor: '#9ca3af',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0
                    },
                    {
                        label: 'Actual Burndown',
                        data: data.map(d => d.actualRemaining),
                        borderColor: '#ff5754',
                        backgroundColor: 'rgba(255, 87, 84, 0.1)',
                        fill: true,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#ff5754',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Remaining Tasks'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Sprint Days'
                        }
                    }
                }
            }
        });
    }

    createVelocityChart(data: VelocityData[]): void {
        if (!this.velocityCanvas) return;

        const ctx = this.velocityCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        this.velocityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.sprintName),
                datasets: [
                    {
                        label: 'Committed',
                        data: data.map(d => d.committedPoints),
                        backgroundColor: '#d1d5db',
                        borderColor: '#9ca3af',
                        borderWidth: 1
                    },
                    {
                        label: 'Completed',
                        data: data.map(d => d.completedPoints),
                        backgroundColor: '#ff5754',
                        borderColor: '#ff5754',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Story Points'
                        }
                    }
                }
            }
        });
    }

    createContributionChart(data: ContributionData[]): void {
        if (!this.contributionCanvas) return;

        const ctx = this.contributionCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        this.contributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.memberName),
                datasets: [{
                    data: data.map(d => d.tasksCompleted),
                    backgroundColor: data.map(d => d.color),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = data.reduce((sum, d) => sum + d.tasksCompleted, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} tasks (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    getEfficiencyColor(): string {
        if (!this.overview) return 'gray';
        switch (this.overview.teamEfficiency) {
            case 'high': return 'green';
            case 'medium': return 'orange';
            case 'low': return 'red';
            default: return 'gray';
        }
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    goToBoard(): void {
        const boardRoute = this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/task-workspace/board'
            : '/student/tasks/board';
        this.router.navigate([boardRoute], {
            queryParams: { projectId: this.projectId }
        });
    }

    goBack(): void {
        const backRoute = this.authService.currentUserValue?.role === 'MENTOR'
            ? '/mentor/task-workspace'
            : '/student/tasks';
        this.router.navigate([backRoute]);
    }

    private handleAnalyticsError(error: any): void {
        const message = error?.error?.message || 'Error loading analytics';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.loading = false;
    }
}
