import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BucketService, ProjectBucket } from '../../core/services/bucket.service';

@Component({
    selector: 'app-bucket-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="bucket-container">
            <div class="header">
                <h2>College Project Ideas</h2>
                <div class="filters">
                    <select [(ngModel)]="filterDifficulty" (change)="applyFilter()">
                        <option value="">All Difficulties</option>
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                </div>
            </div>
            
            <div class="bucket-grid">
                <div *ngFor="let bucket of buckets" class="bucket-card" [class]="bucket.difficultyLevel?.toLowerCase()">
                    <div class="difficulty-badge">{{ bucket.difficultyLevel }}</div>
                    <h3>{{ bucket.title }}</h3>
                    <p class="description">{{ bucket.description }}</p>
                    
                    <div class="technologies">
                        <span *ngFor="let tech of bucket.technologies" class="tech-tag">{{ tech }}</span>
                    </div>
                    
                    <div class="bucket-meta">
                        <span *ngIf="bucket.department">📍 {{ bucket.department }}</span>
                        <span>👥 {{ bucket.availableSlots }}/{{ bucket.maxTeams }} slots</span>
                    </div>
                    
                    <div *ngIf="bucket.deadline" class="deadline">
                        ⏰ Deadline: {{ bucket.deadline | date:'mediumDate' }}
                    </div>
                    
                    <button *ngIf="bucket.availableSlots && bucket.availableSlots > 0" 
                            class="btn-primary" 
                            (click)="selectBucket(bucket)">
                        Choose This Project
                    </button>
                    <span *ngIf="!bucket.availableSlots || bucket.availableSlots <= 0" class="no-slots">
                        No slots available
                    </span>
                </div>
            </div>
            
            <div *ngIf="buckets.length === 0" class="empty-state">
                <p>No project ideas available at the moment.</p>
            </div>
        </div>
    `,
    styles: [`
        .bucket-container { padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .filters select { padding: 8px 15px; border-radius: 4px; border: 1px solid #ddd; }
        .bucket-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .bucket-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); position: relative; border-top: 4px solid; }
        .bucket-card.easy { border-color: #4caf50; }
        .bucket-card.medium { border-color: #ff9800; }
        .bucket-card.hard { border-color: #f44336; }
        .difficulty-badge { position: absolute; top: 10px; right: 10px; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .easy .difficulty-badge { background: #e8f5e9; color: #4caf50; }
        .medium .difficulty-badge { background: #fff3e0; color: #ff9800; }
        .hard .difficulty-badge { background: #ffebee; color: #f44336; }
        h3 { margin: 0 0 10px; color: #333; }
        .description { color: #666; font-size: 14px; line-height: 1.5; }
        .technologies { display: flex; flex-wrap: wrap; gap: 6px; margin: 15px 0; }
        .tech-tag { background: #e3f2fd; color: #1976d2; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
        .bucket-meta { display: flex; gap: 15px; color: #888; font-size: 13px; margin: 10px 0; }
        .deadline { color: #ff9800; font-size: 13px; margin: 10px 0; }
        .btn-primary { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 15px; }
        .no-slots { display: block; text-align: center; color: #999; padding: 12px; background: #f5f5f5; border-radius: 6px; margin-top: 15px; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
    `]
})
export class BucketListComponent implements OnInit {
    buckets: ProjectBucket[] = [];
    allBuckets: ProjectBucket[] = [];
    filterDifficulty = '';

    constructor(private bucketService: BucketService) { }

    ngOnInit() {
        this.loadBuckets();
    }

    loadBuckets() {
        this.bucketService.getAvailableBuckets().subscribe({
            next: (data: ProjectBucket[]) => {
                this.buckets = data;
                this.allBuckets = data;
            },
            error: (err: Error) => console.error('Error loading buckets', err)
        });
    }

    applyFilter() {
        if (this.filterDifficulty) {
            this.bucketService.getBucketsByDifficulty(this.filterDifficulty).subscribe({
                next: (data: ProjectBucket[]) => this.buckets = data,
                error: (err: Error) => console.error('Error filtering', err)
            });
        } else {
            this.buckets = this.allBuckets;
        }
    }

    selectBucket(bucket: ProjectBucket) {
        // Navigate to project creation with bucket data pre-filled
        alert(`Selected: ${bucket.title}\n\nThis would navigate to project creation with pre-filled data.`);
    }
}
