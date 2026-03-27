import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sprint, SprintStatus, SprintRetrospective, CreateSprintRequest } from '../models/sprint.model';

@Injectable({
    providedIn: 'root'
})
export class SprintService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/sprints';

    constructor(private http: HttpClient) { }

    // Get all sprints for a project
    getSprintsByProject(projectId: number): Observable<Sprint[]> {
        return this.http.get<Sprint[]>(`${this.apiUrl}/project/${projectId}`);
    }

    // Get active sprint for a project
    getActiveSprint(projectId: number): Observable<Sprint | null> {
        return this.http.get<Sprint | null>(`${this.apiUrl}/project/${projectId}/active`);
    }

    // Get sprint by ID
    getSprintById(sprintId: number): Observable<Sprint> {
        return this.http.get<Sprint>(`${this.apiUrl}/${sprintId}`);
    }

    // Create new sprint
    createSprint(request: CreateSprintRequest): Observable<Sprint> {
        return this.http.post<Sprint>(`${this.apiUrl}`, request);
    }

    // Start sprint
    startSprint(sprintId: number): Observable<Sprint> {
        return this.http.post<Sprint>(`${this.apiUrl}/${sprintId}/start`, {});
    }

    // Complete sprint
    completeSprint(sprintId: number): Observable<Sprint> {
        return this.http.post<Sprint>(`${this.apiUrl}/${sprintId}/complete`, {});
    }

    // Delete sprint
    deleteSprint(sprintId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${sprintId}`);
    }

    // Get sprint retrospective
    getSprintRetrospective(sprintId: number): Observable<SprintRetrospective | null> {
        return this.http.get<SprintRetrospective | null>(`${this.apiUrl}/${sprintId}/retrospective`);
    }

    // Save retrospective
    saveRetrospective(retro: SprintRetrospective): Observable<SprintRetrospective> {
        return this.http.post<SprintRetrospective>(`${this.apiUrl}/${retro.sprintId}/retrospective`, retro);
    }

    // Get burndown chart data
    getBurndownData(sprintId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${sprintId}/burndown`);
    }

    // Utility methods
    getDaysRemaining(sprint: Sprint): number {
        const now = new Date();
        const end = new Date(sprint.endDate);
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    getProgressPercentage(sprint: Sprint): number {
        if (sprint.totalPoints === 0) return 0;
        return Math.round((sprint.completedPoints / sprint.totalPoints) * 100);
    }

    getStatusColor(status: SprintStatus): string {
        switch (status) {
            case SprintStatus.ACTIVE: return 'primary';
            case SprintStatus.COMPLETED: return 'accent';
            case SprintStatus.PLANNED: return 'warn';
            default: return '';
        }
    }
}
