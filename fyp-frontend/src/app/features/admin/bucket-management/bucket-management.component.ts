import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CollegeBucket, CreateBucketRequest } from '../../../core/models/admin.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-bucket-management',
    templateUrl: './bucket-management.component.html',
    styleUrls: ['./bucket-management.component.scss']
})
export class BucketManagementComponent implements OnInit {
    buckets: CollegeBucket[] = [];
    loading = false;
    showForm = false;
    editingBucket: CollegeBucket | null = null;
    submitting = false;

    // Form fields
    formTitle = '';
    formDescription = '';
    formDepartment = '';
    formTechInput = '';
    formTechnologies: string[] = [];
    formDifficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM';
    formMaxTeams = 1;
    formDeadline = '';

    // Stats
    get totalBuckets(): number { return this.buckets.length; }
    get availableBuckets(): number { return this.buckets.filter(b => b.isAvailable).length; }
    get totalSlots(): number { return this.buckets.reduce((sum, b) => sum + (b.maxTeams || 0), 0); }
    get allocatedSlots(): number { return this.buckets.reduce((sum, b) => sum + (b.allocatedTeams || 0), 0); }

    constructor(
        private adminService: AdminService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadBuckets();
    }

    loadBuckets(): void {
        this.loading = true;
        this.adminService.getProjectBuckets().subscribe({
            next: (buckets) => {
                this.buckets = buckets;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.snackBar.open('Failed to load project buckets', 'Close', { duration: 3000 });
            }
        });
    }

    getDifficultyColor(difficulty: string): string {
        const colors: Record<string, string> = {
            'EASY': 'diff-easy',
            'MEDIUM': 'diff-medium',
            'HARD': 'diff-hard'
        };
        return colors[difficulty] || '';
    }

    getDifficultyIcon(difficulty: string): string {
        const icons: Record<string, string> = {
            'EASY': 'sentiment_satisfied',
            'MEDIUM': 'trending_up',
            'HARD': 'local_fire_department'
        };
        return icons[difficulty] || 'help';
    }

    // ===== Form Management =====
    openAddForm(): void {
        this.editingBucket = null;
        this.resetForm();
        this.showForm = true;
    }

    openEditForm(bucket: CollegeBucket): void {
        this.editingBucket = bucket;
        this.formTitle = bucket.title;
        this.formDescription = bucket.description;
        this.formDepartment = bucket.department || '';
        this.formTechnologies = bucket.technologies ? [...bucket.technologies] : [];
        this.formDifficulty = bucket.difficultyLevel || 'MEDIUM';
        this.formMaxTeams = bucket.maxTeams || 1;
        this.formDeadline = bucket.deadline ? bucket.deadline.substring(0, 10) : '';
        this.formTechInput = '';
        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
        this.editingBucket = null;
        this.resetForm();
    }

    resetForm(): void {
        this.formTitle = '';
        this.formDescription = '';
        this.formDepartment = '';
        this.formTechInput = '';
        this.formTechnologies = [];
        this.formDifficulty = 'MEDIUM';
        this.formMaxTeams = 1;
        this.formDeadline = '';
    }

    addTechnology(): void {
        const tech = this.formTechInput.trim();
        if (tech && !this.formTechnologies.includes(tech)) {
            this.formTechnologies.push(tech);
            this.formTechInput = '';
        }
    }

    addTechOnEnter(event: Event): void {
        const keyEvent = event as KeyboardEvent;
        if (keyEvent.key === 'Enter' || keyEvent.key === ',') {
            keyEvent.preventDefault();
            this.addTechnology();
        }
    }

    removeTechnology(index: number): void {
        this.formTechnologies.splice(index, 1);
    }

    submitForm(): void {
        if (!this.formTitle.trim() || !this.formDescription.trim()) {
            this.snackBar.open('Title and Description are required', 'Close', { duration: 3000 });
            return;
        }

        this.submitting = true;

        if (this.editingBucket) {
            // Update existing bucket
            const updates: Partial<CollegeBucket> = {
                title: this.formTitle,
                description: this.formDescription,
                department: this.formDepartment,
                technologies: this.formTechnologies,
                difficultyLevel: this.formDifficulty,
                maxTeams: this.formMaxTeams,
                deadline: this.formDeadline ? this.formDeadline + 'T00:00:00' : ''
            };

            this.adminService.updateBucket(this.editingBucket.bucketId, updates).subscribe({
                next: () => {
                    this.snackBar.open('Bucket updated successfully', 'Close', { duration: 3000 });
                    this.closeForm();
                    this.loadBuckets();
                    this.submitting = false;
                },
                error: () => {
                    this.snackBar.open('Failed to update bucket', 'Close', { duration: 3000 });
                    this.submitting = false;
                }
            });
        } else {
            // Create new bucket
            const request: CreateBucketRequest = {
                title: this.formTitle,
                description: this.formDescription,
                department: this.formDepartment,
                technologies: this.formTechnologies,
                difficultyLevel: this.formDifficulty,
                maxTeams: this.formMaxTeams,
                deadline: this.formDeadline ? this.formDeadline + 'T00:00:00' : ''
            };

            this.adminService.createBucket(request).subscribe({
                next: () => {
                    this.snackBar.open('Bucket created successfully', 'Close', { duration: 3000 });
                    this.closeForm();
                    this.loadBuckets();
                    this.submitting = false;
                },
                error: () => {
                    this.snackBar.open('Failed to create bucket', 'Close', { duration: 3000 });
                    this.submitting = false;
                }
            });
        }
    }

    // ===== Actions =====
    toggleAvailability(bucket: CollegeBucket): void {
        this.adminService.updateBucket(bucket.bucketId, { isAvailable: !bucket.isAvailable } as any).subscribe({
            next: () => {
                bucket.isAvailable = !bucket.isAvailable;
                this.snackBar.open('Bucket status updated', 'Close', { duration: 3000 });
            },
            error: () => {
                this.snackBar.open('Failed to update bucket', 'Close', { duration: 3000 });
            }
        });
    }

    deleteBucket(bucketId: number): void {
        if (confirm('Are you sure you want to delete this project bucket? This action cannot be undone.')) {
            this.adminService.deleteBucket(bucketId).subscribe({
                next: () => {
                    this.buckets = this.buckets.filter(b => b.bucketId !== bucketId);
                    this.snackBar.open('Bucket deleted successfully', 'Close', { duration: 3000 });
                },
                error: () => {
                    this.snackBar.open('Failed to delete bucket', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
