import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CollegeBucket } from '../../../core/models/admin.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-bucket-management',
    templateUrl: './bucket-management.component.html',
    styleUrls: ['./bucket-management.component.scss']
})
export class BucketManagementComponent implements OnInit {
    buckets: CollegeBucket[] = [];
    loading = false;

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
                this.snackBar.open('Failed to load buckets', 'Close', { duration: 3000 });
            }
        });
    }

    getDifficultyColor(difficulty: string): string {
        const colors: any = {
            'EASY': 'diff-easy',
            'MEDIUM': 'diff-medium',
            'HARD': 'diff-hard'
        };
        return colors[difficulty] || '';
    }

    toggleAvailability(bucket: CollegeBucket): void {
        this.adminService.updateBucket(bucket.bucketId, { isAvailable: !bucket.isAvailable }).subscribe({
            next: () => {
                bucket.isAvailable = !bucket.isAvailable;
                this.snackBar.open('Bucket updated successfully', 'Close', { duration: 3000 });
            },
            error: () => {
                this.snackBar.open('Failed to update bucket', 'Close', { duration: 3000 });
            }
        });
    }

    deleteBucket(bucketId: number): void {
        if (confirm('Are you sure you want to delete this bucket?')) {
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
