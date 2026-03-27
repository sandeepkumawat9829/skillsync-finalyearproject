import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
    users: any[] = [];
    filteredUsers: any[] = [];
    loading = false;
    selectedRole: string = 'ALL';

    roles = ['ALL', 'STUDENT', 'MENTOR', 'ADMIN'];
    displayedColumns: string[] = ['id', 'fullName', 'email', 'department', 'role', 'isActive', 'actions'];

    constructor(
        private adminService: AdminService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.adminService.getUsers().subscribe({
            next: (users) => {
                this.users = users;
                this.applyFilter();
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
            }
        });
    }

    applyFilter(): void {
        if (this.selectedRole === 'ALL') {
            this.filteredUsers = this.users;
        } else {
            this.filteredUsers = this.users.filter(u => u.role === this.selectedRole);
        }
    }

    toggleUserStatus(user: any): void {
        this.adminService.toggleUserStatus(user.id).subscribe({
            next: () => {
                user.isActive = !user.isActive;
                this.snackBar.open(
                    `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                    'Close',
                    { duration: 3000 }
                );
            },
            error: () => {
                this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
            }
        });
    }

    deleteUser(userId: number): void {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            this.adminService.deleteUser(userId).subscribe({
                next: () => {
                    this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
                    this.loadUsers();
                },
                error: () => {
                    this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getRoleColor(role: string): string {
        const colors: any = {
            'STUDENT': 'role-student',
            'MENTOR': 'role-mentor',
            'ADMIN': 'role-admin'
        };
        return colors[role] || '';
    }

    exportCSV(): void {
        this.adminService.exportUsers().subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_report_${new Date().toLocaleDateString()}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this.snackBar.open('Error exporting CSV', 'Close', { duration: 3000 });
            }
        });
    }
}
