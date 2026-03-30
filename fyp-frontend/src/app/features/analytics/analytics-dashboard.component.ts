import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Chart, registerables } from 'chart.js';
import { AnalyticsService } from '../../core/services/analytics.service';

Chart.register(...registerables);

@Component({
    selector: 'app-analytics-dashboard',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    template: `
        <div class="analytics-container">
            <div class="analytics-header">
                <h1><mat-icon style="vertical-align: middle; font-size: 28px; height: 28px; width: 28px; margin-right: 8px;">analytics</mat-icon>Analytics Dashboard</h1>
                <p>Track your project progress and team performance</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #667eea;">assignment</mat-icon></div>
                    <div class="stat-value">{{ totalTasks }}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #10b981;">check_circle</mat-icon></div>
                    <div class="stat-value">{{ completedTasks }}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #f59e0b;">schedule</mat-icon></div>
                    <div class="stat-value">{{ totalHours }}h</div>
                    <div class="stat-label">Hours Logged</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><mat-icon style="font-size: 36px; height: 36px; width: 36px; color: #ef4444;">track_changes</mat-icon></div>
                    <div class="stat-value">{{ completionRate }}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="chart-card">
                    <h3>Task Distribution</h3>
                    <canvas #taskDistributionChart></canvas>
                </div>
                <div class="chart-card">
                    <h3>Sprint Progress</h3>
                    <canvas #sprintProgressChart></canvas>
                </div>
                <div class="chart-card">
                    <h3>Team Contributions</h3>
                    <canvas #contributionsChart></canvas>
                </div>
                <div class="chart-card">
                    <h3>Weekly Activity</h3>
                    <canvas #weeklyActivityChart></canvas>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .analytics-container {
            padding: 30px;
            max-width: 1400px;
            margin: 0 auto;
            min-height: 100vh;
            background: #f5f7fa;
        }

        .analytics-header {
            margin-bottom: 30px;
        }

        .analytics-header h1 {
            font-size: 28px;
            color: #333;
            margin: 0 0 10px 0;
        }

        .analytics-header p {
            color: #666;
            margin: 0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
            font-size: 36px;
            margin-bottom: 10px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #888;
            font-size: 14px;
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
        }

        .chart-card {
            background: white;
            border-radius: 16px;
            padding: 25px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .chart-card h3 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 18px;
        }

        canvas {
            max-height: 300px;
        }

        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `]
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('taskDistributionChart') taskDistributionCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('sprintProgressChart') sprintProgressCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('contributionsChart') contributionsCanvas!: ElementRef<HTMLCanvasElement>;
    @ViewChild('weeklyActivityChart') weeklyActivityCanvas!: ElementRef<HTMLCanvasElement>;

    totalTasks = 0;
    completedTasks = 0;
    totalHours = 0;
    completionRate = 0;

    constructor(private analyticsService: AnalyticsService) { }

    ngOnInit(): void {
        this.loadStats();
    }

    ngAfterViewInit(): void {
        // Initialize charts after view is ready
        setTimeout(() => {
            this.createTaskDistributionChart();
            this.createSprintProgressChart();
            this.createContributionsChart();
            this.createWeeklyActivityChart();
        }, 100);
    }

    loadStats(): void {
        // Demo data - replace with actual API calls
        this.totalTasks = 45;
        this.completedTasks = 28;
        this.totalHours = 156;
        this.completionRate = Math.round((this.completedTasks / this.totalTasks) * 100);
    }

    createTaskDistributionChart(): void {
        if (!this.taskDistributionCanvas) return;

        new Chart(this.taskDistributionCanvas.nativeElement, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'To Do', 'Blocked'],
                datasets: [{
                    data: [28, 10, 5, 2],
                    backgroundColor: [
                        '#10b981',
                        '#667eea',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createSprintProgressChart(): void {
        if (!this.sprintProgressCanvas) return;

        new Chart(this.sprintProgressCanvas.nativeElement, {
            type: 'line',
            data: {
                labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                datasets: [
                    {
                        label: 'Ideal',
                        data: [45, 38, 31, 24, 17, 10, 0],
                        borderColor: '#cbd5e1',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0
                    },
                    {
                        label: 'Actual',
                        data: [45, 40, 35, 28, 22, 15, 8],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Remaining Tasks'
                        }
                    }
                }
            }
        });
    }

    createContributionsChart(): void {
        if (!this.contributionsCanvas) return;

        new Chart(this.contributionsCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: ['Alice', 'Bob', 'Carol', 'David'],
                datasets: [{
                    label: 'Hours Contributed',
                    data: [42, 38, 35, 41],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }

    createWeeklyActivityChart(): void {
        if (!this.weeklyActivityCanvas) return;

        new Chart(this.weeklyActivityCanvas.nativeElement, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        label: 'Tasks Completed',
                        data: [5, 8, 4, 6, 3, 1, 1],
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderRadius: 4
                    },
                    {
                        label: 'Commits',
                        data: [12, 15, 8, 10, 6, 2, 0],
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}
