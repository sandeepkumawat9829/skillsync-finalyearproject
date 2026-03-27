import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-team-management',
  templateUrl: './team-management.component.html',
  styleUrls: ['./team-management.component.scss']
})
export class TeamManagementComponent implements OnInit {
  teams: any[] = [];
  loading = false;
  displayedColumns: string[] = ['teamId', 'teamName', 'projectTitle', 'teamLeaderName', 'members', 'status', 'mentorName', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.adminService.getTeams().subscribe({
      next: (data) => {
        this.teams = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTeam(id: number): void {
    if (confirm('Are you sure you want to delete this team? This will remove all member assignments.')) {
      this.adminService.deleteTeam(id).subscribe({
        next: () => {
          this.snackBar.open('Team deleted successfully', 'Close', { duration: 3000 });
          this.loadTeams();
        },
        error: () => {
          this.snackBar.open('Error deleting team', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateStatus(id: number, status: string): void {
    this.adminService.updateTeamStatus(id, status).subscribe({
      next: () => {
        this.snackBar.open('Team status updated', 'Close', { duration: 2000 });
        this.loadTeams();
      },
      error: () => {
        this.snackBar.open('Error updating team status', 'Close', { duration: 3000 });
      }
    });
  }

  exportCSV(): void {
    this.adminService.exportTeams().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `teams_report_${new Date().toLocaleDateString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Error exporting CSV', 'Close', { duration: 3000 });
      }
    });
  }
}
