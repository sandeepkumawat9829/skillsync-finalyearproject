import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MilestoneService, Milestone } from '../../core/services/milestone.service';

@Component({
    selector: 'app-milestone-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="milestone-container">
            <div class="header">
                <h2>Project Milestones</h2>
                <button class="btn-primary" (click)="showAddForm = !showAddForm">
                    {{ showAddForm ? 'Cancel' : '+ Add Milestone' }}
                </button>
            </div>
            
            <div *ngIf="showAddForm" class="add-form">
                <input [(ngModel)]="newMilestone.milestoneName" placeholder="Milestone Name" />
                <textarea [(ngModel)]="newMilestone.description" placeholder="Description"></textarea>
                <input type="datetime-local" [(ngModel)]="newMilestone.dueDate" />
                <button class="btn-primary" (click)="createMilestone()">Create</button>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="projectProgress"></div>
                <span class="progress-text">{{ projectProgress | number:'1.0-0' }}% Complete</span>
            </div>
            
            <div class="milestone-list">
                <div *ngFor="let milestone of milestones" 
                     class="milestone-card" 
                     [class.completed]="milestone.status === 'COMPLETED'"
                     [class.overdue]="milestone.isOverdue">
                    <div class="milestone-header">
                        <h3>{{ milestone.milestoneName }}</h3>
                        <span class="status-badge" [class]="milestone.status?.toLowerCase()">
                            {{ milestone.status }}
                        </span>
                    </div>
                    <p class="description">{{ milestone.description }}</p>
                    <div class="milestone-meta">
                        <span *ngIf="milestone.dueDate">Due: {{ milestone.dueDate | date:'mediumDate' }}</span>
                        <span>Progress: {{ milestone.completionPercentage }}%</span>
                    </div>
                    <div class="milestone-progress">
                        <div class="bar" [style.width.%]="milestone.completionPercentage"></div>
                    </div>
                    <div class="milestone-actions">
                        <button *ngIf="milestone.status !== 'COMPLETED'" 
                                (click)="updateStatus(milestone.milestoneId!, 'IN_PROGRESS')">
                            Start
                        </button>
                        <button *ngIf="milestone.status === 'IN_PROGRESS'" 
                                class="btn-success"
                                (click)="completeMilestone(milestone.milestoneId!)">
                            Complete
                        </button>
                        <button class="btn-danger" (click)="deleteMilestone(milestone.milestoneId!)">
                            Delete
                        </button>
                    </div>
                    <div *ngIf="milestone.reviewedByMentor" class="mentor-feedback">
                        <strong>Mentor Feedback:</strong> {{ milestone.mentorFeedback }}
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .milestone-container { padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .add-form { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
        .add-form input, .add-form textarea { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .progress-bar { background: #e0e0e0; height: 30px; border-radius: 15px; margin-bottom: 20px; position: relative; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #4caf50, #8bc34a); height: 100%; transition: width 0.3s; }
        .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; }
        .milestone-list { display: flex; flex-direction: column; gap: 15px; }
        .milestone-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .milestone-card.completed { border-left: 4px solid #4caf50; }
        .milestone-card.overdue { border-left: 4px solid #f44336; }
        .milestone-header { display: flex; justify-content: space-between; align-items: center; }
        .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .status-badge.pending { background: #fff3e0; color: #ff9800; }
        .status-badge.in_progress { background: #e3f2fd; color: #2196f3; }
        .status-badge.completed { background: #e8f5e9; color: #4caf50; }
        .description { color: #666; margin: 10px 0; }
        .milestone-meta { display: flex; gap: 20px; color: #888; font-size: 14px; margin-bottom: 10px; }
        .milestone-progress { background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden; }
        .milestone-progress .bar { background: #2196f3; height: 100%; transition: width 0.3s; }
        .milestone-actions { display: flex; gap: 10px; margin-top: 15px; }
        .milestone-actions button { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-primary { background: #2196f3; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
        .btn-success { background: #4caf50; color: white; }
        .btn-danger { background: #f44336; color: white; }
        .mentor-feedback { margin-top: 10px; padding: 10px; background: #f0f7ff; border-radius: 4px; }
    `]
})
export class MilestoneListComponent implements OnInit {
    @Input() projectId!: number;

    milestones: Milestone[] = [];
    projectProgress: number = 0;
    showAddForm = false;
    newMilestone: Milestone = { projectId: 0, milestoneName: '' };

    constructor(private milestoneService: MilestoneService) { }

    ngOnInit() {
        if (this.projectId) {
            this.newMilestone.projectId = this.projectId;
            this.loadMilestones();
            this.loadProgress();
        }
    }

    loadMilestones() {
        this.milestoneService.getProjectMilestones(this.projectId).subscribe({
            next: (data: Milestone[]) => this.milestones = data,
            error: (err: Error) => console.error('Error loading milestones', err)
        });
    }

    loadProgress() {
        this.milestoneService.getProjectProgress(this.projectId).subscribe({
            next: (data: { progress: number }) => this.projectProgress = data.progress,
            error: (err: Error) => console.error('Error loading progress', err)
        });
    }

    createMilestone() {
        this.milestoneService.createMilestone(this.newMilestone).subscribe({
            next: () => {
                this.loadMilestones();
                this.loadProgress();
                this.showAddForm = false;
                this.newMilestone = { projectId: this.projectId, milestoneName: '' };
            },
            error: (err: Error) => console.error('Error creating milestone', err)
        });
    }

    updateStatus(milestoneId: number, status: string) {
        this.milestoneService.updateStatus(milestoneId, status).subscribe({
            next: () => {
                this.loadMilestones();
                this.loadProgress();
            },
            error: (err: Error) => console.error('Error updating status', err)
        });
    }

    completeMilestone(milestoneId: number) {
        this.milestoneService.completeMilestone(milestoneId).subscribe({
            next: () => {
                this.loadMilestones();
                this.loadProgress();
            },
            error: (err: Error) => console.error('Error completing milestone', err)
        });
    }

    deleteMilestone(milestoneId: number) {
        if (confirm('Delete this milestone?')) {
            this.milestoneService.deleteMilestone(milestoneId).subscribe({
                next: () => {
                    this.loadMilestones();
                    this.loadProgress();
                },
                error: (err: Error) => console.error('Error deleting milestone', err)
            });
        }
    }
}
