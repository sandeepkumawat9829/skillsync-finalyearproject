import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssignedTeam, Mentor, MentorRequest } from '../models/mentor.model';

@Injectable({
    providedIn: 'root'
})
export class MentorService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/mentors';

    constructor(private http: HttpClient) { }

    // Get all mentors
    getAllMentors(): Observable<Mentor[]> {
        return this.http.get<Mentor[]>(`${this.apiUrl}`);
    }

    // Get available mentors (with capacity)
    getAvailableMentors(): Observable<Mentor[]> {
        return this.http.get<Mentor[]>(`${this.apiUrl}/available`);
    }

    // Get mentor by ID
    getMentorById(mentorId: number): Observable<Mentor> {
        return this.http.get<Mentor>(`${this.apiUrl}/${mentorId}`);
    }

    // Search mentors by expertise
    searchMentors(query: string): Observable<Mentor[]> {
        return this.http.get<Mentor[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
    }

    // Send mentor request (from team)
    sendMentorRequest(request: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/request`, request);
    }

    // Get my mentor requests (student side)
    getMyRequests(): Observable<MentorRequest[]> {
        return this.http.get<MentorRequest[]>(`${this.apiUrl}/requests/my`);
    }

    // Cancel mentor request
    cancelRequest(requestId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/requests/${requestId}`);
    }

    // ===== MENTOR DASHBOARD METHODS =====

    // Get mentor profile by user ID
    getMentorProfile(userId: number): Observable<any> {
        return this.http.get<any>(`https://skillsync-finalyearproject.onrender.com/api/profile/mentor/${userId}`);
    }

    // Get mentor stats
    getMentorStats(mentorId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${mentorId}/stats`);
    }

    // Get pending mentor requests (for mentor's view)
    getPendingMentorRequests(mentorId: number): Observable<MentorRequest[]> {
        return this.http.get<MentorRequest[]>(`${this.apiUrl}/requests/pending`);
    }

    // Get all mentor requests (for mentor's view - all statuses)
    getAllMentorRequests(): Observable<MentorRequest[]> {
        return this.http.get<MentorRequest[]>(`${this.apiUrl}/requests/all`);
    }

    // Accept mentor request
    acceptMentorRequest(requestId: number, feedback: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/requests/${requestId}/accept`, { feedback });
    }

    // Reject mentor request
    rejectMentorRequest(requestId: number, reason: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/requests/${requestId}/reject`, { reason });
    }

    // Get assigned teams (for mentor's view)
    getAssignedTeams(mentorId: number): Observable<AssignedTeam[]> {
        return this.http.get<AssignedTeam[]>(`${this.apiUrl}/${mentorId}/teams`);
    }

    // Get my assignments (auth-based)
    getMyAssignments(): Observable<AssignedTeam[]> {
        return this.http.get<AssignedTeam[]>(`${this.apiUrl}/assignments`);
    }

    // Update my mentor profile
    updateMentorProfile(updates: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/profile`, updates);
    }
}
