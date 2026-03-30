import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MentorService } from '../../../core/services/mentor.service';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentService } from '../../../core/services/document.service';
import { AssignedTeam } from '../../../core/models/mentor.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-mentor-dashboard',
    templateUrl: './mentor-dashboard.component.html',
    styleUrls: ['./mentor-dashboard.component.scss']
})
export class MentorDashboardComponent implements OnInit {
    loading = false;
    exportingTeamId: number | null = null;

    // Stats
    stats = {
        pendingRequests: 0,
        assignedTeams: 0,
        upcomingMeetings: 0,
        totalProjects: 0
    };

    // Recent requests (top 3)
    recentRequests: any[] = [];

    // Assigned teams (top 2)
    assignedTeams: AssignedTeam[] = [];

    constructor(
        private mentorService: MentorService,
        private documentService: DocumentService,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading = true;

        // Get all requests (for stats and recent pending)
        this.mentorService.getAllMentorRequests().subscribe({
            next: (requests) => {
                const pending = requests.filter(r => r.status === 'PENDING');
                this.recentRequests = pending.slice(0, 3);
                this.stats.pendingRequests = pending.length;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });

        // Get assigned teams
        this.mentorService.getMyAssignments().subscribe({
            next: (teams) => {
                this.assignedTeams = teams;
                this.stats.assignedTeams = teams.length;
                this.stats.totalProjects = teams.length;
            }
        });
    }

    navigateTo(route: string): void {
        this.router.navigate([`/mentor/${route}`]);
    }

    viewRequest(requestId: number): void {
        this.router.navigate(['/mentor/requests'], { queryParams: { id: requestId } });
    }

    viewTeam(teamId: number): void {
        this.router.navigate(['/mentor/team-workspace', teamId]);
    }

    openKanban(team: AssignedTeam): void {
        this.router.navigate(['/mentor/task-workspace/board'], {
            queryParams: { projectId: team.projectId }
        });
    }

    exportTeamData(team: AssignedTeam): void {
        this.exportingTeamId = team.teamId;
        this.snackBar.open('Generating Mega Report...', 'Close', { duration: 3000 });
        
        // Render chart hidden
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        
        const myChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Remaining'],
                datasets: [{
                    data: [team.progress, 100 - team.progress],
                    backgroundColor: ['#4caf50', '#e0e0e0']
                }]
            },
            options: { animation: false } // Disable animation to draw immediately
        });

        const chartBase64 = myChart.toBase64Image();
        myChart.destroy();
        
        this.documentService.exportMegaReport(team.projectId, { progressChartBase64: chartBase64 }).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Mega_Report_${team.teamName.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                this.snackBar.open('Export downloaded successfully!', 'Close', { duration: 3000 });
                this.exportingTeamId = null;
            },
            error: () => {
                this.snackBar.open('Failed to generate export', 'Close', { duration: 3000 });
                this.exportingTeamId = null;
            }
        });
    }
}
