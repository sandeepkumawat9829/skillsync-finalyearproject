import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemAnalytics, UserManagement, CollegeBucket, CreateBucketRequest } from '../models/admin.model';

export interface TeamWithoutMentor {
    teamId: number;
    teamName: string;
    projectId: number;
    projectTitle: string;
    teamLeaderId: number;
    teamLeaderName: string;
    currentMemberCount: number;
    maxMembers: number;
    isComplete: boolean;
    status: string;
    createdAt: string;
}

export interface ForceAssignResponse {
    message: string;
    assignmentId: number;
    teamId: number;
    mentorId: number;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = '/api/admin';

    constructor(private http: HttpClient) { }

    // Get system analytics
    getSystemAnalytics(): Observable<SystemAnalytics> {
        return this.http.get<SystemAnalytics>(`${this.apiUrl}/dashboard`);
    }

    // Get all users
    getUsers(role?: 'STUDENT' | 'MENTOR' | 'ADMIN'): Observable<UserManagement[]> {
        let url = `${this.apiUrl}/users`;
        if (role) url += `?role=${role}`;
        return this.http.get<UserManagement[]>(url);
    }

    // Toggle user status (enable/disable)
    toggleUserStatus(userId: number): Observable<UserManagement> {
        return this.http.put<UserManagement>(`${this.apiUrl}/users/${userId}/toggle-status`, {});
    }

    // Enable user
    enableUser(userId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/users/${userId}/enable`, {});
    }

    // Disable user
    disableUser(userId: number): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/users/${userId}/disable`, {});
    }

    // Delete user
    deleteUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
    }

    // Get project buckets
    getProjectBuckets(): Observable<CollegeBucket[]> {
        return this.http.get<CollegeBucket[]>(`${this.apiUrl}/buckets`);
    }

    // Create project bucket
    createBucket(request: CreateBucketRequest): Observable<CollegeBucket> {
        return this.http.post<CollegeBucket>(`${this.apiUrl}/buckets`, request);
    }

    // Update project bucket
    updateBucket(bucketId: number, updates: Partial<CollegeBucket>): Observable<CollegeBucket> {
        return this.http.put<CollegeBucket>(`${this.apiUrl}/buckets/${bucketId}`, updates);
    }

    // Delete project bucket
    deleteBucket(bucketId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/buckets/${bucketId}`);
    }

    // ==================== HOD MENTOR FALLBACK ====================

    // Get teams that don't have a mentor assigned
    getTeamsWithoutMentor(): Observable<TeamWithoutMentor[]> {
        return this.http.get<TeamWithoutMentor[]>(`${this.apiUrl}/teams/without-mentor`);
    }

    // Force-assign a mentor to a team (admin only)
    forceAssignMentor(teamId: number, mentorId: number): Observable<ForceAssignResponse> {
        return this.http.post<ForceAssignResponse>(
            `${this.apiUrl}/teams/${teamId}/assign-mentor`,
            { mentorId }
        );
    }

    // ==================== PROJECT MANAGEMENT ====================

    getProjects(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/projects`);
    }

    deleteProject(projectId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
    }

    updateProjectStatus(projectId: number, status: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/projects/${projectId}/status`, { status });
    }

    // ==================== TEAM MANAGEMENT ====================

    getTeams(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/teams`);
    }

    deleteTeam(teamId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/teams/${teamId}`);
    }

    updateTeamStatus(teamId: number, status: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/teams/${teamId}/status`, { status });
    }

    // ==================== REPORT EXPORT ====================

    exportUsers(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/reports/users/export`, { responseType: 'blob' });
    }

    exportProjects(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/reports/projects/export`, { responseType: 'blob' });
    }

    exportTeams(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/reports/teams/export`, { responseType: 'blob' });
    }
}
