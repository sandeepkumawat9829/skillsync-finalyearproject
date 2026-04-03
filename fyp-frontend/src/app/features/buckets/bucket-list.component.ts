import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BucketService, ProjectBucket } from '../../core/services/bucket.service';

@Component({
    selector: 'app-bucket-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="bucket-page">
            <!-- Page Header -->
            <div class="page-header">
                <div class="header-text">
                    <h2>Project Ideas Bucket</h2>
                    <p class="subtitle">Browse available project ideas posted by the department. Choose one to kickstart your FYP.</p>
                </div>
                <div class="header-controls">
                    <div class="search-box">
                        <span class="search-icon">&#128269;</span>
                        <input type="text" [(ngModel)]="searchQuery" (input)="applySearch()" placeholder="Search projects...">
                    </div>
                    <div class="filter-group">
                        <select [(ngModel)]="filterDifficulty" (change)="applyFilter()" class="filter-select">
                            <option value="">All Levels</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                        <select [(ngModel)]="filterDepartment" (change)="applySearch()" class="filter-select">
                            <option value="">All Departments</option>
                            <option *ngFor="let dept of departments" [value]="dept">{{dept}}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Stats Row -->
            <div class="stats-row" *ngIf="allBuckets.length > 0">
                <div class="stat-pill">
                    <span class="stat-num">{{allBuckets.length}}</span>
                    <span class="stat-txt">Total Projects</span>
                </div>
                <div class="stat-pill available">
                    <span class="stat-num">{{availableCount}}</span>
                    <span class="stat-txt">Available</span>
                </div>
                <div class="stat-pill">
                    <span class="stat-num">{{departments.length}}</span>
                    <span class="stat-txt">Departments</span>
                </div>
            </div>

            <!-- Bucket Grid -->
            <div class="bucket-grid">
                <div *ngFor="let bucket of buckets; trackBy: trackByBucket"
                     class="bucket-card"
                     [class.easy]="bucket.difficultyLevel === 'EASY'"
                     [class.medium]="bucket.difficultyLevel === 'MEDIUM'"
                     [class.hard]="bucket.difficultyLevel === 'HARD'"
                     [class.no-slots]="!bucket.availableSlots || bucket.availableSlots <= 0">

                    <div class="card-top-accent"></div>

                    <div class="card-header">
                        <div class="difficulty-badge">
                            <span class="diff-icon" *ngIf="bucket.difficultyLevel === 'EASY'">&#9733;</span>
                            <span class="diff-icon" *ngIf="bucket.difficultyLevel === 'MEDIUM'">&#9733;&#9733;</span>
                            <span class="diff-icon" *ngIf="bucket.difficultyLevel === 'HARD'">&#9733;&#9733;&#9733;</span>
                            {{ bucket.difficultyLevel }}
                        </div>
                    </div>

                    <h3 class="card-title">{{ bucket.title }}</h3>
                    <p class="description">{{ bucket.description }}</p>

                    <div class="technologies" *ngIf="bucket.technologies && bucket.technologies.length">
                        <span *ngFor="let tech of bucket.technologies" class="tech-tag">{{ tech }}</span>
                    </div>

                    <div class="card-meta">
                        <div class="meta-item" *ngIf="bucket.department">
                            <span class="meta-icon">&#8226;</span>
                            <span>{{ bucket.department }}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-icon">&#9679;</span>
                            <span>{{ bucket.availableSlots || 0 }}/{{ bucket.maxTeams }} slots available</span>
                        </div>
                    </div>

                    <div *ngIf="bucket.deadline" class="deadline-row">
                        <span class="deadline-icon">&#9200;</span>
                        <span>Deadline: {{ bucket.deadline | date:'mediumDate' }}</span>
                    </div>

                    <button *ngIf="bucket.availableSlots && bucket.availableSlots > 0"
                            class="btn-choose"
                            (click)="selectBucket(bucket)">
                        Choose This Project
                    </button>
                    <div *ngIf="!bucket.availableSlots || bucket.availableSlots <= 0" class="slots-full">
                        All slots have been filled
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="buckets.length === 0 && !loading" class="empty-state">
                <div class="empty-icon">&#128194;</div>
                <h3>No Projects Found</h3>
                <p *ngIf="searchQuery || filterDifficulty || filterDepartment">Try adjusting your filters to see more results.</p>
                <p *ngIf="!searchQuery && !filterDifficulty && !filterDepartment">No project ideas are available at the moment. Check back later.</p>
            </div>

            <!-- Loading -->
            <div *ngIf="loading" class="loading-state">
                <div class="loader"></div>
                <p>Loading project ideas...</p>
            </div>
        </div>
    `,
    styles: [`
        .bucket-page {
            padding: 28px 32px;
            max-width: 1400px;
            margin: 0 auto;
            font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        .page-header {
            margin-bottom: 28px;
        }

        .header-text h2 {
            margin: 0 0 6px;
            font-size: 26px;
            font-weight: 700;
            color: #1e293b;
        }

        .header-text .subtitle {
            margin: 0 0 20px;
            color: #64748b;
            font-size: 14px;
        }

        .header-controls {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            align-items: center;
        }

        .search-box {
            display: flex;
            align-items: center;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0 14px;
            flex: 1;
            min-width: 220px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-box:focus-within {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-box .search-icon {
            font-size: 16px;
            margin-right: 8px;
            filter: grayscale(1);
        }

        .search-box input {
            border: none;
            outline: none;
            padding: 12px 0;
            font-size: 14px;
            width: 100%;
            background: transparent;
            color: #334155;
        }

        .filter-group {
            display: flex;
            gap: 10px;
        }

        .filter-select {
            padding: 10px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 14px;
            color: #334155;
            background: white;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 8L1 3h10z' fill='%2394a3b8'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 32px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .filter-select:focus {
            border-color: #667eea;
            outline: none;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        /* Stats Row */
        .stats-row {
            display: flex;
            gap: 14px;
            margin-bottom: 28px;
            flex-wrap: wrap;
        }

        .stat-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            background: white;
            border-radius: 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .stat-pill .stat-num {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
        }

        .stat-pill .stat-txt {
            font-size: 13px;
            color: #64748b;
        }

        .stat-pill.available .stat-num {
            color: #059669;
        }

        /* Bucket Grid */
        .bucket-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 24px;
        }

        .bucket-card {
            background: white;
            border-radius: 14px;
            padding: 0 24px 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.06);
            position: relative;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            border: 1px solid rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .bucket-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 16px 32px rgba(0,0,0,0.1);
        }

        .bucket-card.no-slots {
            opacity: 0.65;
        }

        .card-top-accent {
            height: 4px;
            margin: 0 -24px 20px;
            border-radius: 0;
        }

        .bucket-card.easy .card-top-accent {
            background: linear-gradient(90deg, #10b981, #34d399);
        }
        .bucket-card.medium .card-top-accent {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }
        .bucket-card.hard .card-top-accent {
            background: linear-gradient(90deg, #ef4444, #f87171);
        }

        .card-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 4px;
        }

        .difficulty-badge {
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .diff-icon {
            font-size: 10px;
        }

        .easy .difficulty-badge {
            background: rgba(16, 185, 129, 0.1);
            color: #059669;
        }
        .medium .difficulty-badge {
            background: rgba(245, 158, 11, 0.1);
            color: #d97706;
        }
        .hard .difficulty-badge {
            background: rgba(239, 68, 68, 0.1);
            color: #dc2626;
        }

        .card-title {
            margin: 0 0 10px;
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.3;
        }

        .description {
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 16px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 16px;
        }

        .tech-tag {
            background: linear-gradient(135deg, #eef2ff, #e0e7ff);
            color: #4338ca;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid rgba(99, 102, 241, 0.1);
        }

        .card-meta {
            display: flex;
            flex-direction: column;
            gap: 6px;
            color: #64748b;
            font-size: 13px;
            margin-bottom: 10px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .meta-icon {
            color: #94a3b8;
            font-size: 10px;
        }

        .deadline-row {
            color: #d97706;
            font-size: 13px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 500;
        }

        .deadline-icon {
            font-size: 14px;
        }

        .btn-choose {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            margin-top: auto;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-choose:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .slots-full {
            text-align: center;
            color: #94a3b8;
            padding: 12px;
            background: #f1f5f9;
            border-radius: 10px;
            margin-top: auto;
            font-size: 13px;
            font-weight: 500;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 80px 24px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .empty-icon {
            font-size: 56px;
            margin-bottom: 16px;
            filter: grayscale(0.6);
        }

        .empty-state h3 {
            font-size: 20px;
            font-weight: 700;
            color: #334155;
            margin: 0 0 8px;
        }

        .empty-state p {
            color: #64748b;
            font-size: 14px;
            margin: 0;
        }

        /* Loading */
        .loading-state {
            text-align: center;
            padding: 80px;
        }

        .loader {
            width: 40px;
            height: 40px;
            border: 3px solid #e2e8f0;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .loading-state p {
            color: #64748b;
            font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .bucket-page { padding: 16px; }
            .bucket-grid { grid-template-columns: 1fr; }
            .header-controls { flex-direction: column; }
            .search-box { min-width: 100%; }
            .filter-group { width: 100%; }
            .filter-select { flex: 1; }
        }
    `]
})
export class BucketListComponent implements OnInit {
    buckets: ProjectBucket[] = [];
    allBuckets: ProjectBucket[] = [];
    filterDifficulty = '';
    filterDepartment = '';
    searchQuery = '';
    departments: string[] = [];
    loading = false;

    get availableCount(): number {
        return this.allBuckets.filter(b => b.availableSlots && b.availableSlots > 0).length;
    }

    constructor(private bucketService: BucketService) { }

    ngOnInit() {
        this.loadBuckets();
    }

    loadBuckets() {
        this.loading = true;
        this.bucketService.getAvailableBuckets().subscribe({
            next: (data: ProjectBucket[]) => {
                this.allBuckets = data;
                this.buckets = data;
                this.departments = [...new Set(data.map(b => b.department).filter(Boolean) as string[])];
                this.loading = false;
            },
            error: (err: Error) => {
                console.error('Error loading buckets', err);
                this.loading = false;
            }
        });
    }

    applyFilter() {
        if (this.filterDifficulty) {
            this.bucketService.getBucketsByDifficulty(this.filterDifficulty).subscribe({
                next: (data: ProjectBucket[]) => {
                    this.allBuckets = data;
                    this.applySearch();
                },
                error: (err: Error) => console.error('Error filtering', err)
            });
        } else {
            this.loadBuckets();
        }
    }

    applySearch() {
        let filtered = [...this.allBuckets];
        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.title.toLowerCase().includes(q) ||
                b.description.toLowerCase().includes(q) ||
                (b.technologies && b.technologies.some(t => t.toLowerCase().includes(q)))
            );
        }
        if (this.filterDepartment) {
            filtered = filtered.filter(b => b.department === this.filterDepartment);
        }
        this.buckets = filtered;
    }

    selectBucket(bucket: ProjectBucket) {
        alert(`Selected: ${bucket.title}\n\nThis would navigate to project creation with pre-filled data.`);
    }

    trackByBucket(index: number, bucket: ProjectBucket): number | undefined {
        return bucket.bucketId;
    }
}
