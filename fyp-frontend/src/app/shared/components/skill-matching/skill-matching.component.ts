import { Component, Input, OnInit } from '@angular/core';
import { AIService, StudentSuggestion } from '../../../core/services/ai.service';

@Component({
    selector: 'app-skill-matching',
    template: `
        <div class="skill-matching">
            <div class="header">
                <h3>🎯 AI Team Suggestions</h3>
                <p>Students matching your project requirements</p>
            </div>
            
            <div class="loading" *ngIf="loading">
                <span class="spinner"></span> Finding matches...
            </div>
            
            <div class="suggestions" *ngIf="!loading && suggestions.length > 0">
                <div class="suggestion-card" *ngFor="let student of suggestions">
                    <div class="student-info">
                        <h4>{{ student.fullName }}</h4>
                        <span class="branch">{{ student.branch }} - Sem {{ student.currentSemester }}</span>
                    </div>
                    <div class="match-score">
                        <div class="score-bar">
                            <div class="score-fill" [style.width.%]="student.matchScore"></div>
                        </div>
                        <span class="score-text">{{ student.matchScore | number:'1.0-0' }}% match</span>
                    </div>
                    <div class="skills">
                        <span class="skill" *ngFor="let skill of student.skills | slice:0:5">{{ skill }}</span>
                    </div>
                    <div class="actions">
                        <a *ngIf="student.githubUrl" [href]="student.githubUrl" target="_blank" class="link">GitHub</a>
                        <a *ngIf="student.linkedinUrl" [href]="student.linkedinUrl" target="_blank" class="link">LinkedIn</a>
                        <button class="btn-invite" (click)="invite(student)">Invite to Team</button>
                    </div>
                </div>
            </div>
            
            <div class="no-results" *ngIf="!loading && suggestions.length === 0">
                <p>No matching students found. Try adding more technologies to your project.</p>
            </div>
        </div>
    `,
    styles: [`
        .skill-matching { padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .header h3 { margin: 0 0 0.25rem; }
        .header p { color: #666; font-size: 0.9rem; margin: 0 0 1rem; }
        .loading { text-align: center; padding: 2rem; color: #666; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #e0e0e0; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .suggestion-card { padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 0.75rem; }
        .student-info h4 { margin: 0 0 0.25rem; color: #1a1a2e; }
        .branch { color: #666; font-size: 0.85rem; }
        .match-score { margin: 0.75rem 0; }
        .score-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
        .score-fill { height: 100%; background: linear-gradient(90deg, #10b981, #4f46e5); transition: width 0.5s; }
        .score-text { font-size: 0.85rem; color: #4f46e5; font-weight: 600; }
        .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0; }
        .skill { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem; }
        .actions { display: flex; gap: 0.5rem; align-items: center; }
        .link { color: #4f46e5; text-decoration: none; font-size: 0.85rem; }
        .btn-invite { background: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-left: auto; }
        .btn-invite:hover { background: #4338ca; }
        .no-results { text-align: center; padding: 2rem; color: #666; }
    `]
})
export class SkillMatchingComponent implements OnInit {
    @Input() projectId!: number;
    suggestions: StudentSuggestion[] = [];
    loading = false;

    constructor(private aiService: AIService) { }

    ngOnInit(): void {
        if (this.projectId) {
            this.loadSuggestions();
        }
    }

    loadSuggestions(): void {
        this.loading = true;
        this.aiService.suggestTeamMembers(this.projectId, 10).subscribe({
            next: (data) => {
                this.suggestions = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading suggestions:', err);
                this.loading = false;
            }
        });
    }

    invite(student: StudentSuggestion): void {
        // Emit event or call team service to send invitation
        console.log('Invite student:', student);
        alert(`Invitation sent to ${student.fullName}!`);
    }
}
