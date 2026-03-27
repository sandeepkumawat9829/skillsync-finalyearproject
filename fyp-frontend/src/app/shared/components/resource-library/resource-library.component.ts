import { Component, Input, OnInit } from '@angular/core';
import { ResourceService, SharedResource } from '../../../core/services/resource.service';

@Component({
    selector: 'app-resource-library',
    template: `
        <div class="resource-library">
            <div class="header">
                <h3>📚 Team Resources</h3>
                <button class="btn-add" (click)="showAddForm = !showAddForm">
                    {{ showAddForm ? '✕ Cancel' : '+ Add Resource' }}
                </button>
            </div>
            
            <div class="add-form" *ngIf="showAddForm">
                <input type="text" [(ngModel)]="newResource.resourceTitle" placeholder="Resource title">
                <select [(ngModel)]="newResource.resourceType">
                    <option value="ARTICLE">Article</option>
                    <option value="RESEARCH_PAPER">Research Paper</option>
                    <option value="TUTORIAL">Tutorial</option>
                    <option value="VIDEO">Video</option>
                    <option value="TOOL">Tool</option>
                    <option value="OTHER">Other</option>
                </select>
                <input type="text" [(ngModel)]="newResource.resourceUrl" placeholder="URL (optional)">
                <textarea [(ngModel)]="newResource.description" placeholder="Description"></textarea>
                <select [(ngModel)]="newResource.projectPhase">
                    <option value="">Select Phase</option>
                    <option value="PLANNING">Planning</option>
                    <option value="DESIGN">Design</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="TESTING">Testing</option>
                </select>
                <button class="btn-save" (click)="saveResource()">Save Resource</button>
            </div>
            
            <div class="filters">
                <button [class.active]="selectedType === ''" (click)="filterByType('')">All</button>
                <button [class.active]="selectedType === 'ARTICLE'" (click)="filterByType('ARTICLE')">📄 Articles</button>
                <button [class.active]="selectedType === 'TUTORIAL'" (click)="filterByType('TUTORIAL')">📖 Tutorials</button>
                <button [class.active]="selectedType === 'VIDEO'" (click)="filterByType('VIDEO')">🎬 Videos</button>
                <button [class.active]="selectedType === 'TOOL'" (click)="filterByType('TOOL')">🔧 Tools</button>
            </div>
            
            <div class="resources-list">
                <div class="resource-item" *ngFor="let resource of resources">
                    <div class="resource-icon">{{ getTypeIcon(resource.resourceType) }}</div>
                    <div class="resource-content">
                        <h4>
                            <a *ngIf="resource.resourceUrl" [href]="resource.resourceUrl" target="_blank">
                                {{ resource.resourceTitle }}
                            </a>
                            <span *ngIf="!resource.resourceUrl">{{ resource.resourceTitle }}</span>
                        </h4>
                        <p *ngIf="resource.description">{{ resource.description }}</p>
                        <div class="resource-meta">
                            <span class="type">{{ resource.resourceType }}</span>
                            <span class="phase" *ngIf="resource.projectPhase">{{ resource.projectPhase }}</span>
                            <span class="author">by {{ resource.sharedByName }}</span>
                        </div>
                    </div>
                    <button class="btn-delete" (click)="deleteResource(resource)" title="Delete">🗑️</button>
                </div>
            </div>
            
            <div class="no-resources" *ngIf="resources.length === 0">
                <p>No resources shared yet. Be the first to add a helpful resource!</p>
            </div>
        </div>
    `,
    styles: [`
        .resource-library { padding: 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .header h3 { margin: 0; }
        .btn-add { background: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
        .add-form { display: grid; gap: 0.75rem; padding: 1rem; background: #f9fafb; border-radius: 8px; margin-bottom: 1rem; }
        .add-form input, .add-form select, .add-form textarea { padding: 0.5rem; border: 1px solid #e0e0e0; border-radius: 6px; }
        .add-form textarea { min-height: 80px; resize: vertical; }
        .btn-save { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
        .filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
        .filters button { padding: 0.375rem 0.75rem; border: 1px solid #e0e0e0; background: white; border-radius: 16px; cursor: pointer; font-size: 0.85rem; }
        .filters button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
        .resource-item { display: flex; gap: 1rem; padding: 1rem; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 0.75rem; align-items: flex-start; }
        .resource-icon { font-size: 1.5rem; }
        .resource-content { flex: 1; }
        .resource-content h4 { margin: 0 0 0.5rem; }
        .resource-content h4 a { color: #4f46e5; text-decoration: none; }
        .resource-content h4 a:hover { text-decoration: underline; }
        .resource-content p { margin: 0 0 0.5rem; color: #666; font-size: 0.9rem; }
        .resource-meta { display: flex; gap: 0.75rem; font-size: 0.8rem; color: #888; }
        .type { background: #e0e7ff; color: #4f46e5; padding: 0.125rem 0.5rem; border-radius: 8px; }
        .phase { background: #fef3c7; color: #b45309; padding: 0.125rem 0.5rem; border-radius: 8px; }
        .btn-delete { background: none; border: none; cursor: pointer; opacity: 0.5; }
        .btn-delete:hover { opacity: 1; }
        .no-resources { text-align: center; padding: 2rem; color: #666; }
    `]
})
export class ResourceLibraryComponent implements OnInit {
    @Input() teamId!: number;
    resources: SharedResource[] = [];
    showAddForm = false;
    selectedType = '';
    newResource: SharedResource = {
        resourceTitle: '',
        resourceType: 'ARTICLE',
        resourceUrl: '',
        description: '',
        projectPhase: undefined
    };

    constructor(private resourceService: ResourceService) { }

    ngOnInit(): void {
        if (this.teamId) {
            this.loadResources();
        }
    }

    loadResources(): void {
        this.resourceService.getTeamResources(this.teamId, this.selectedType || undefined).subscribe({
            next: (data) => this.resources = data,
            error: (err) => console.error('Error loading resources:', err)
        });
    }

    filterByType(type: string): void {
        this.selectedType = type;
        this.loadResources();
    }

    saveResource(): void {
        if (!this.newResource.resourceTitle.trim()) return;
        this.newResource.teamId = this.teamId;
        this.resourceService.createResource(this.newResource).subscribe({
            next: () => {
                this.loadResources();
                this.showAddForm = false;
                this.newResource = { resourceTitle: '', resourceType: 'ARTICLE', resourceUrl: '', description: '' };
            },
            error: (err) => console.error('Error saving resource:', err)
        });
    }

    deleteResource(resource: SharedResource): void {
        if (!resource.resourceId) return;
        if (confirm('Delete this resource?')) {
            this.resourceService.deleteResource(resource.resourceId).subscribe({
                next: () => this.loadResources(),
                error: (err) => console.error('Error deleting resource:', err)
            });
        }
    }

    getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            ARTICLE: '📄',
            RESEARCH_PAPER: '📑',
            TUTORIAL: '📖',
            VIDEO: '🎬',
            TOOL: '🔧',
            OTHER: '📁'
        };
        return icons[type] || '📁';
    }
}
