import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Issue, IssueComment, CreateIssueRequest, UpdateIssueRequest } from '../models/issue.model';

@Injectable({
    providedIn: 'root'
})
export class IssueService {
    private apiUrl = 'https://outermost-leisha-noncoherently.ngrok-free.de/api/issues';

    constructor(private http: HttpClient) { }

    // Get issues by project
    getIssuesByProject(projectId: number): Observable<Issue[]> {
        return this.http.get<Issue[]>(`${this.apiUrl}/project/${projectId}`);
    }

    // Get issue by ID
    getIssueById(issueId: number): Observable<Issue> {
        return this.http.get<Issue>(`${this.apiUrl}/${issueId}`);
    }

    // Create issue
    createIssue(request: CreateIssueRequest): Observable<Issue> {
        return this.http.post<Issue>(`${this.apiUrl}`, request);
    }

    // Update issue
    updateIssue(issueId: number, updates: UpdateIssueRequest): Observable<Issue> {
        return this.http.put<Issue>(`${this.apiUrl}/${issueId}`, updates);
    }

    // Assign issue to user
    assignIssue(issueId: number, userId: number): Observable<Issue> {
        return this.http.put<Issue>(`${this.apiUrl}/${issueId}/assign`, { userId });
    }

    // Link issue to task
    linkTask(issueId: number, taskId: number): Observable<Issue> {
        return this.http.post<Issue>(`${this.apiUrl}/${issueId}/link-task/${taskId}`, {});
    }

    // Add comment to issue
    addComment(issueId: number, commentText: string): Observable<IssueComment> {
        return this.http.post<IssueComment>(`${this.apiUrl}/${issueId}/comments`, { commentText });
    }

    // Get comments for issue
    getComments(issueId: number): Observable<IssueComment[]> {
        return this.http.get<IssueComment[]>(`${this.apiUrl}/${issueId}/comments`);
    }

    // Delete issue
    deleteIssue(issueId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${issueId}`);
    }
}
