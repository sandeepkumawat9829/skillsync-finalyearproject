import { Component, Input, OnInit } from '@angular/core';
import { AIService, PlagiarismResult } from '../../../core/services/ai.service';

@Component({
    selector: 'app-plagiarism-check',
    template: `
        <div class="plagiarism-check">
            <div class="header">
                <h3>🔍 Plagiarism Check</h3>
                <button class="btn-check" (click)="runCheck()" [disabled]="loading">
                    {{ loading ? 'Checking...' : 'Run Check' }}
                </button>
            </div>
            
            <div class="loading" *ngIf="loading">
                <span class="spinner"></span> Analyzing project abstract...
            </div>
            
            <div class="result" *ngIf="!loading && result">
                <div class="score-section" [class]="getStatusClass()">
                    <div class="score-circle">
                        <span class="score">{{ result.similarityScore | number:'1.0-0' }}%</span>
                        <span class="label">Similarity</span>
                    </div>
                    <div class="status">
                        <span class="status-badge" [class]="getStatusClass()">{{ getStatusLabel() }}</span>
                        <p class="status-desc">{{ getStatusDesc() }}</p>
                    </div>
                </div>
                
                <div class="similar-projects" *ngIf="result.similarProjects?.length > 0">
                    <h4>Similar Projects Found:</h4>
                    <div class="project-item" *ngFor="let project of result.similarProjects">
                        <span class="project-title">{{ project.projectTitle }}</span>
                        <span class="similarity-badge">{{ project.similarity | number:'1.0-0' }}%</span>
                    </div>
                </div>
            </div>
            
            <div class="no-abstract" *ngIf="!loading && result?.status === 'NO_ABSTRACT'">
                <p>⚠️ No abstract found. Please add a project abstract first.</p>
            </div>
        </div>
    `,
    styles: [`
        .plagiarism-check { padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .header h3 { margin: 0; }
        .btn-check { background: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
        .btn-check:disabled { background: #9ca3af; cursor: not-allowed; }
        .loading { text-align: center; padding: 2rem; color: #666; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #e0e0e0; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .score-section { display: flex; align-items: center; gap: 1.5rem; padding: 1rem; border-radius: 8px; }
        .score-section.low { background: #ecfdf5; }
        .score-section.moderate { background: #fef3c7; }
        .score-section.high { background: #fef2f2; }
        .score-circle { text-align: center; min-width: 80px; }
        .score { display: block; font-size: 1.75rem; font-weight: 700; }
        .label { font-size: 0.8rem; color: #666; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600; }
        .status-badge.low { background: #10b981; color: white; }
        .status-badge.moderate { background: #f59e0b; color: white; }
        .status-badge.high { background: #ef4444; color: white; }
        .status-desc { margin: 0.5rem 0 0; color: #666; font-size: 0.9rem; }
        .similar-projects { margin-top: 1.5rem; }
        .similar-projects h4 { margin: 0 0 0.75rem; font-size: 0.95rem; }
        .project-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
        .project-title { color: #1a1a2e; }
        .similarity-badge { background: #fee2e2; color: #ef4444; padding: 0.125rem 0.5rem; border-radius: 8px; font-size: 0.8rem; }
        .no-abstract { text-align: center; padding: 1rem; color: #b45309; background: #fef3c7; border-radius: 8px; }
    `]
})
export class PlagiarismCheckComponent implements OnInit {
    @Input() projectId!: number;
    result: PlagiarismResult | null = null;
    loading = false;

    constructor(private aiService: AIService) { }

    ngOnInit(): void { }

    runCheck(): void {
        if (!this.projectId) return;
        this.loading = true;
        this.aiService.checkPlagiarism(this.projectId).subscribe({
            next: (data) => {
                this.result = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Plagiarism check error:', err);
                this.loading = false;
            }
        });
    }

    getStatusClass(): string {
        if (!this.result) return 'low';
        switch (this.result.status) {
            case 'HIGH_SIMILARITY': return 'high';
            case 'MODERATE_SIMILARITY': return 'moderate';
            default: return 'low';
        }
    }

    getStatusLabel(): string {
        if (!this.result) return '';
        switch (this.result.status) {
            case 'HIGH_SIMILARITY': return '⚠️ High Similarity';
            case 'MODERATE_SIMILARITY': return '⚡ Moderate';
            default: return '✅ Original';
        }
    }

    getStatusDesc(): string {
        if (!this.result) return '';
        switch (this.result.status) {
            case 'HIGH_SIMILARITY': return 'This abstract has significant overlap with existing projects.';
            case 'MODERATE_SIMILARITY': return 'Some similarities found. Consider revising the abstract.';
            default: return 'Your project abstract appears to be original.';
        }
    }
}
