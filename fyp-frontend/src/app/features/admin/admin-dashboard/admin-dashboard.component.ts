import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    analytics: any = null;
    loading = false;

    registrationChart: Chart | null = null;
    projectChart: Chart | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadAnalytics();
    }

    loadAnalytics(): void {
        this.loading = true;
        this.adminService.getSystemAnalytics().subscribe({
            next: (data: any) => {
                this.analytics = data;
                this.loading = false;
                setTimeout(() => {
                    this.createCharts();
                }, 100);
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    createCharts(): void {
        if (!this.analytics) return;

        // Registration Trend Chart
        const regTrend = this.analytics.registrationTrend || [];
        const regCanvas = document.getElementById('registrationChart') as HTMLCanvasElement;
        if (regCanvas && regTrend.length > 0) {
            const regConfig: ChartConfiguration = {
                type: 'line',
                data: {
                    labels: regTrend.map((t: any) => t.date),
                    datasets: [{
                        label: 'New Registrations',
                        data: regTrend.map((t: any) => t.count),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            };
            this.registrationChart = new Chart(regCanvas, regConfig);
        }

        // Project Creation Chart
        const projTrend = this.analytics.projectCreationTrend || [];
        const projCanvas = document.getElementById('projectChart') as HTMLCanvasElement;
        if (projCanvas && projTrend.length > 0) {
            const projConfig: ChartConfiguration = {
                type: 'bar',
                data: {
                    labels: projTrend.map((t: any) => t.date),
                    datasets: [{
                        label: 'New Projects',
                        data: projTrend.map((t: any) => t.count),
                        backgroundColor: '#10b981',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            };
            this.projectChart = new Chart(projCanvas, projConfig);
        }
    }

    ngOnDestroy(): void {
        if (this.registrationChart) this.registrationChart.destroy();
        if (this.projectChart) this.projectChart.destroy();
    }
}
