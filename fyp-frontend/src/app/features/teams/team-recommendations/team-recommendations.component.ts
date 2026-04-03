import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';
import { Team } from '../../../core/models/project.model';

@Component({
    selector: 'app-team-recommendations',
    templateUrl: './team-recommendations.component.html',
    styleUrls: ['./team-recommendations.component.scss']
})
export class TeamRecommendationsComponent implements OnInit {
    teamId!: number;
    team: Team | null = null;
    recommendations: any[] = [];
    topRecommendations: any[] = [];
    otherRecommendations: any[] = [];
    loading = true;
    invitingIds = new Set<number>();
    invitedIds = new Set<number>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private teamService: TeamService,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.teamId = +(this.route.snapshot.paramMap.get('teamId') || this.route.snapshot.queryParamMap.get('teamId') || 0);
        if (!this.teamId) {
            this.snackBar.open('Team not found', 'Close', { duration: 3000 });
            this.router.navigate(['/student/teams']);
            return;
        }
        this.loadTeam();
        this.loadRecommendations();
    }

    loadTeam(): void {
        this.teamService.getTeamById(this.teamId).subscribe({
            next: (team) => this.team = team,
            error: () => this.snackBar.open('Error loading team info', 'Close', { duration: 3000 })
        });
    }

    loadRecommendations(): void {
        this.loading = true;
        this.teamService.getRecommendations(this.teamId).subscribe({
            next: (data) => {
                this.recommendations = data;
                this.topRecommendations = data.slice(0, 3);
                this.otherRecommendations = data.slice(3);
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading recommendations', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    inviteMember(rec: any): void {
        if (!this.teamId || this.invitingIds.has(rec.userId)) return;

        this.invitingIds.add(rec.userId);
        const request = {
            teamId: this.teamId,
            email: rec.email,
            message: `You have been invited to join our team based on your skill match!`
        };

        this.teamService.sendInvitation(this.teamId, request).subscribe({
            next: () => {
                this.snackBar.open(`Invitation sent to ${rec.fullName}!`, 'Close', { duration: 3000 });
                this.invitingIds.delete(rec.userId);
                this.invitedIds.add(rec.userId);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error sending invitation';
                this.snackBar.open(msg, 'Close', { duration: 3000 });
                this.invitingIds.delete(rec.userId);
            }
        });
    }

    isInviting(userId: number): boolean {
        return this.invitingIds.has(userId);
    }

    isInvited(userId: number): boolean {
        return this.invitedIds.has(userId);
    }

    getScoreClass(score: number): string {
        if (score >= 75) return 'high-match';
        if (score >= 50) return 'med-match';
        return 'low-match';
    }

    goBack(): void {
        this.router.navigate(['/student/teams', this.teamId]);
    }
}
