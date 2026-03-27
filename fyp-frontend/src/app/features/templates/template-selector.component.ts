import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService, ProjectTemplate } from '../../core/services/template.service';

@Component({
    selector: 'app-template-selector',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="template-container">
            <div class="header">
                <h2>🚀 Start from Template</h2>
                <p>Choose a project template to get started quickly</p>
            </div>
            
            <div class="domain-filter">
                <button [class.active]="selectedDomain === ''" (click)="filterByDomain('')">All</button>
                <button [class.active]="selectedDomain === 'WEB_APP'" (click)="filterByDomain('WEB_APP')">Web App</button>
                <button [class.active]="selectedDomain === 'MOBILE_APP'" (click)="filterByDomain('MOBILE_APP')">Mobile</button>
                <button [class.active]="selectedDomain === 'AI_ML'" (click)="filterByDomain('AI_ML')">AI/ML</button>
                <button [class.active]="selectedDomain === 'IOT'" (click)="filterByDomain('IOT')">IoT</button>
                <button [class.active]="selectedDomain === 'BLOCKCHAIN'" (click)="filterByDomain('BLOCKCHAIN')">Blockchain</button>
            </div>
            
            <div class="template-grid">
                <div *ngFor="let template of templates" 
                     class="template-card"
                     [class.selected]="selectedTemplate?.templateId === template.templateId"
                     (click)="selectTemplate(template)">
                    <div class="domain-icon">{{ getDomainIcon(template.domain) }}</div>
                    <h3>{{ template.templateName }}</h3>
                    <span class="domain-badge">{{ template.domain }}</span>
                    <p class="description">{{ template.description }}</p>
                    
                    <div *ngIf="template.suggestedTechnologies?.length" class="tech-section">
                        <strong>Technologies:</strong>
                        <div class="tech-tags">
                            <span *ngFor="let tech of template.suggestedTechnologies" class="tech-tag">{{ tech }}</span>
                        </div>
                    </div>
                    
                    <div *ngIf="template.requiredSkills?.length" class="skills-section">
                        <strong>Skills Needed:</strong>
                        <div class="skill-tags">
                            <span *ngFor="let skill of template.requiredSkills" class="skill-tag">{{ skill }}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div *ngIf="selectedTemplate" class="preview-panel">
                <h3>Preview: {{ selectedTemplate.templateName }}</h3>
                <div class="preview-section">
                    <h4>Objectives Template</h4>
                    <pre>{{ selectedTemplate.objectivesTemplate || 'No template provided' }}</pre>
                </div>
                <div class="preview-section">
                    <h4>Methodology Template</h4>
                    <pre>{{ selectedTemplate.methodologyTemplate || 'No template provided' }}</pre>
                </div>
                <button class="btn-primary" (click)="useTemplate()">
                    Use This Template
                </button>
            </div>
            
            <div *ngIf="templates.length === 0" class="empty-state">
                <p>No templates available for this domain.</p>
            </div>
        </div>
    `,
    styles: [`
        .template-container { padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h2 { margin-bottom: 5px; }
        .header p { color: #666; }
        .domain-filter { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; flex-wrap: wrap; }
        .domain-filter button { padding: 10px 20px; border: 2px solid #e0e0e0; border-radius: 25px; background: white; cursor: pointer; transition: all 0.2s; }
        .domain-filter button:hover { border-color: #667eea; }
        .domain-filter button.active { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-color: transparent; }
        .template-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .template-card { background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s; }
        .template-card:hover { border-color: #667eea; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0,0,0,0.1); }
        .template-card.selected { border-color: #667eea; background: #f8f6ff; }
        .domain-icon { font-size: 40px; margin-bottom: 10px; }
        h3 { margin: 0 0 5px; color: #333; }
        .domain-badge { display: inline-block; background: #e3f2fd; color: #1976d2; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin-bottom: 10px; }
        .description { color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 15px; }
        .tech-section, .skills-section { margin-top: 10px; }
        .tech-section strong, .skills-section strong { font-size: 12px; color: #888; display: block; margin-bottom: 5px; }
        .tech-tags, .skill-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .tech-tag { background: #e8f5e9; color: #4caf50; padding: 3px 8px; border-radius: 10px; font-size: 11px; }
        .skill-tag { background: #fff3e0; color: #ff9800; padding: 3px 8px; border-radius: 10px; font-size: 11px; }
        .preview-panel { margin-top: 30px; background: #f5f5f5; border-radius: 12px; padding: 20px; }
        .preview-section { margin: 15px 0; }
        .preview-section h4 { margin: 0 0 10px; color: #666; }
        .preview-section pre { background: white; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 13px; }
        .btn-primary { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; margin-top: 15px; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
    `]
})
export class TemplateSelectorComponent implements OnInit {
    templates: ProjectTemplate[] = [];
    allTemplates: ProjectTemplate[] = [];
    selectedTemplate: ProjectTemplate | null = null;
    selectedDomain = '';

    constructor(private templateService: TemplateService) { }

    ngOnInit() {
        this.loadTemplates();
    }

    loadTemplates() {
        this.templateService.getAllTemplates().subscribe({
            next: (data: ProjectTemplate[]) => {
                this.templates = data;
                this.allTemplates = data;
            },
            error: (err: Error) => console.error('Error loading templates', err)
        });
    }

    filterByDomain(domain: string) {
        this.selectedDomain = domain;
        if (domain) {
            this.templateService.getTemplatesByDomain(domain).subscribe({
                next: (data: ProjectTemplate[]) => this.templates = data,
                error: (err: Error) => console.error('Error filtering', err)
            });
        } else {
            this.templates = this.allTemplates;
        }
    }

    selectTemplate(template: ProjectTemplate) {
        this.selectedTemplate = template;
    }

    useTemplate() {
        alert(`Using template: ${this.selectedTemplate?.templateName}\n\nThis would navigate to project creation with template data pre-filled.`);
    }

    getDomainIcon(domain?: string): string {
        switch (domain) {
            case 'WEB_APP': return '🌐';
            case 'MOBILE_APP': return '📱';
            case 'AI_ML': return '🤖';
            case 'IOT': return '🔌';
            case 'BLOCKCHAIN': return '⛓️';
            default: return '💻';
        }
    }
}
