import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.scss']
})
export class ProjectManagementComponent implements OnInit {
  projects: any[] = [];
  loading = false;
  displayedColumns: string[] = ['projectId', 'title', 'createdByName', 'domain', 'teamName', 'status', 'actions'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.adminService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error loading projects', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project?')) {
      this.adminService.deleteProject(id).subscribe({
        next: () => {
          this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
          this.loadProjects();
        },
        error: () => {
          this.snackBar.open('Error deleting project', 'Close', { duration: 3000 });
        }
      });
    }
  }

  updateStatus(id: number, status: string): void {
    this.adminService.updateProjectStatus(id, status).subscribe({
      next: () => {
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
        this.loadProjects();
      },
      error: () => {
        this.snackBar.open('Error updating status', 'Close', { duration: 3000 });
      }
    });
  }

  exportCSV(): void {
    this.adminService.exportProjects().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projects_report_${new Date().toLocaleDateString()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.snackBar.open('Error exporting CSV', 'Close', { duration: 3000 });
      }
    });
  }
}
