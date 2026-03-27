import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MentorService } from '../../../core/services/mentor.service';
import { AuthService } from '../../../core/services/auth.service';
import { AssignedTeam } from '../../../core/models/mentor.model';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-mentor-dashboard',
    templateUrl: './mentor-dashboard.component.html',
    styleUrls: ['./mentor-dashboard.component.scss']
})
export class MentorDashboardComponent implements OnInit {
    loading = false;

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


}
