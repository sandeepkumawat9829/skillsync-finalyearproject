import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BucketService, ProjectBucket } from '../../../core/services/bucket.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
    projects: Project[] = [];
    buckets: ProjectBucket[] = [];
    filteredProjects: Project[] = [];

    loading = false;
    selectedTab = 0; // 0: All Projects, 1: My Projects, 2: College Buckets

    // Filters
    searchQuery = '';
    selectedDomain = 'ALL';
    selectedStatus = 'ALL';

    domains = ['ALL', 'AI_ML', 'WEB_APP', 'MOBILE_APP', 'IOT', 'BLOCKCHAIN'];
    statuses = ['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

    constructor(
        private projectService: ProjectService,
        private bucketService: BucketService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadProjects();
        this.loadBuckets();
    }

    loadProjects(): void {
        this.loading = true;
        this.projectService.getProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.snackBar.open('Error loading projects', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    loadBuckets(): void {
        this.bucketService.getAvailableBuckets().subscribe({
            next: (data) => {
                this.buckets = data.filter(bucket => bucket.isAvailable);
            },
            error: (error) => {
                console.error('Error loading buckets:', error);
                this.snackBar.open('Error loading project buckets', 'Close', { duration: 3000 });
            }
        });
    }

    onTabChange(index: number): void {
        this.selectedTab = index;
        if (this.selectedTab === 1) {
            // Load my projects
            this.loadMyProjects();
        } else if (this.selectedTab === 0) {
            this.loadProjects();
        }
    }

    loadMyProjects(): void {
        this.loading = true;
        this.projectService.getMyProjects().subscribe({
            next: (data) => {
                this.projects = data;
                this.applyFilters();
                this.loading = false;
            },
            error: (error) => {
                this.snackBar.open('Error loading your projects', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    applyFilters(): void {
        this.filteredProjects = this.projects.filter(project => {
            const matchesSearch = !this.searchQuery ||
                project.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                project.abstractText.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesDomain = this.selectedDomain === 'ALL' || project.domain === this.selectedDomain;
            const matchesStatus = this.selectedStatus === 'ALL' || project.status === this.selectedStatus;

            return matchesSearch && matchesDomain && matchesStatus;
        });
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onDomainChange(): void {
        this.applyFilters();
    }

    onStatusChange(): void {
        this.applyFilters();
    }

    viewProject(projectId: number): void {
        this.router.navigate(['/student/projects', projectId]);
    }

    createProject(): void {
        this.router.navigate(['/student/projects/create']);
    }

    getDomainIcon(domain: string): string {
        const icons: any = {
            'AI_ML': 'psychology',
            'WEB_APP': 'web',
            'MOBILE_APP': 'phone_android',
            'IOT': 'devices',
            'BLOCKCHAIN': 'link'
        };
        return icons[domain] || 'folder';
    }

    getStatusColor(status: string): string {
        const colors: any = {
            'DRAFT': 'gray',
            'SUBMITTED': 'blue',
            'APPROVED': 'green',
            'IN_PROGRESS': 'orange',
            'COMPLETED': 'purple'
        };
        return colors[status] || 'gray';
    }

    getDifficultyClass(level: string): string {
        const classes: any = {
            'EASY': 'easy',
            'MEDIUM': 'medium',
            'HARD': 'hard'
        };
        return classes[level] || '';
    }

    selectBucket(bucket: ProjectBucket): void {
        this.router.navigate(['/student/projects/create'], {
            queryParams: { bucketId: bucket.bucketId }
        });
    }

    openGithub(url: string, event: Event): void {
        event.stopPropagation();
        window.open(url, '_blank');
    }
}
