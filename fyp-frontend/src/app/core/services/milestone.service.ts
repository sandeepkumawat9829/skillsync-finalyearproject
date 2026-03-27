import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Milestone {
    milestoneId?: number;
    projectId: number;
    projectTitle?: string;
    milestoneName: string;
    description?: string;
    dueDate?: string;
    status?: string;
    completionPercentage?: number;
    reviewedByMentor?: boolean;
    mentorFeedback?: string;
    createdAt?: string;
    completedAt?: string;
    isOverdue?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class MilestoneService {
    private apiUrl = 'https://outermost-leisha-noncoherently.ngrok-free.de/api/milestones';

    constructor(private http: HttpClient) { }

    getProjectMilestones(projectId: number): Observable<Milestone[]> {
        return this.http.get<Milestone[]>(`${this.apiUrl}/project/${projectId}`);
    }

    getMilestone(milestoneId: number): Observable<Milestone> {
        return this.http.get<Milestone>(`${this.apiUrl}/${milestoneId}`);
    }

    createMilestone(milestone: Milestone): Observable<Milestone> {
        return this.http.post<Milestone>(this.apiUrl, milestone);
    }

    updateMilestone(milestoneId: number, milestone: Milestone): Observable<Milestone> {
        return this.http.put<Milestone>(`${this.apiUrl}/${milestoneId}`, milestone);
    }

    updateStatus(milestoneId: number, status: string): Observable<Milestone> {
        return this.http.post<Milestone>(`${this.apiUrl}/${milestoneId}/status`, { status });
    }

    completeMilestone(milestoneId: number): Observable<Milestone> {
        return this.http.post<Milestone>(`${this.apiUrl}/${milestoneId}/complete`, {});
    }

    addMentorReview(milestoneId: number, feedback: string): Observable<Milestone> {
        return this.http.post<Milestone>(`${this.apiUrl}/${milestoneId}/review`, { feedback });
    }

    getOverdueMilestones(projectId: number): Observable<Milestone[]> {
        return this.http.get<Milestone[]>(`${this.apiUrl}/project/${projectId}/overdue`);
    }

    getPendingReviews(projectId: number): Observable<Milestone[]> {
        return this.http.get<Milestone[]>(`${this.apiUrl}/project/${projectId}/pending-reviews`);
    }

    getProjectProgress(projectId: number): Observable<{ progress: number }> {
        return this.http.get<{ progress: number }>(`${this.apiUrl}/project/${projectId}/progress`);
    }

    deleteMilestone(milestoneId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${milestoneId}`);
    }
}
