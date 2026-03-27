import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { SkillCatalogService, SkillAnalytics } from '../../../core/services/skill.service';
import { Chart, ChartConfiguration, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

@Component({
    selector: 'app-skill-graph',
    templateUrl: './skill-graph.component.html',
    styleUrls: ['./skill-graph.component.scss']
})
export class SkillGraphComponent implements OnChanges, AfterViewInit {
    @Input() teamId!: number;
    @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

    chart: Chart | null = null;
    skillAnalytics: SkillAnalytics | null = null;
    loading = false;
    error: string | null = null;

    // Category labels for display
    categoryLabels: { [key: string]: string } = {
        'FRONTEND': 'Frontend',
        'BACKEND': 'Backend',
        'DATABASE': 'Database',
        'ML': 'Machine Learning',
        'TESTING': 'Testing',
        'DEVOPS': 'DevOps',
        'MOBILE': 'Mobile',
        'CLOUD': 'Cloud',
        'OTHER': 'Other'
    };

    constructor(private skillService: SkillCatalogService) { }

    ngAfterViewInit(): void {
        if (this.teamId) {
            this.loadSkillData();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['teamId'] && !changes['teamId'].firstChange && this.teamId) {
            this.loadSkillData();
        }
    }

    loadSkillData(): void {
        this.loading = true;
        this.error = null;

        this.skillService.getTeamSkillGraph(this.teamId).subscribe({
            next: (data) => {
                this.skillAnalytics = data;
                this.loading = false;
                this.renderChart();
            },
            error: (err) => {
                console.error('Error loading skill data:', err);
                this.error = 'Failed to load skill analytics';
                this.loading = false;
            }
        });
    }

    renderChart(): void {
        if (!this.skillAnalytics || !this.radarCanvas) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = this.radarCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

        const categories = Object.keys(this.skillAnalytics.categoryScores);
        const labels = categories.map(cat => this.categoryLabels[cat] || cat);
        const scores = categories.map(cat => this.skillAnalytics!.categoryScores[cat]);

        const config: ChartConfiguration<'radar'> = {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Team Skill Coverage',
                    data: scores,
                    fill: true,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        min: 0,
                        ticks: {
                            stepSize: 20,
                            showLabelBackdrop: false,
                            font: {
                                size: 10
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                }
            }
        };

        this.chart = new Chart(ctx, config);
    }

    getCoverageClass(coverage: number): string {
        if (coverage >= 70) return 'high';
        if (coverage >= 40) return 'medium';
        return 'low';
    }
}
