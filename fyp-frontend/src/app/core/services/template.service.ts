import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectTemplate {
    templateId?: number;
    templateName: string;
    domain: string;
    description?: string;
    objectivesTemplate?: string;
    methodologyTemplate?: string;
    expectedOutcomeTemplate?: string;
    suggestedTechnologies?: string[];
    requiredSkills?: string[];
    isActive?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TemplateService {
    private apiUrl = 'http://localhost:8080/api/templates';

    constructor(private http: HttpClient) { }

    getAllTemplates(): Observable<ProjectTemplate[]> {
        return this.http.get<ProjectTemplate[]>(this.apiUrl);
    }

    getTemplatesByDomain(domain: string): Observable<ProjectTemplate[]> {
        return this.http.get<ProjectTemplate[]>(`${this.apiUrl}/domain/${domain}`);
    }

    getTemplate(templateId: number): Observable<ProjectTemplate> {
        return this.http.get<ProjectTemplate>(`${this.apiUrl}/${templateId}`);
    }

    createTemplate(template: ProjectTemplate): Observable<ProjectTemplate> {
        return this.http.post<ProjectTemplate>(this.apiUrl, template);
    }

    updateTemplate(templateId: number, template: ProjectTemplate): Observable<ProjectTemplate> {
        return this.http.put<ProjectTemplate>(`${this.apiUrl}/${templateId}`, template);
    }

    deleteTemplate(templateId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${templateId}`);
    }
}
