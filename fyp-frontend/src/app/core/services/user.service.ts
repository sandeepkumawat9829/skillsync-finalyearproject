import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentProfile, MentorProfile } from '../models/user.model';

export interface DashboardData {
    profile: StudentProfile;
    projectCount: number;
    teamCount: number;
    pendingInvitations: number;
    tasksDue: number;
    upcomingMeetings: any[];
    recentNotifications: any[];
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:8080/api/users';

    constructor(private http: HttpClient) { }

    // Get current user profile (student)
    getMyProfile(): Observable<StudentProfile> {
        return this.http.get<StudentProfile>(`${this.apiUrl}/profile`);
    }

    // Update current user profile
    updateMyProfile(request: Partial<StudentProfile>): Observable<StudentProfile> {
        return this.http.put<StudentProfile>(`${this.apiUrl}/profile`, request);
    }

    // Get student dashboard data
    getDashboard(): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
    }

    // Search students (for team invitations)
    searchStudents(query: string, branch?: string, semester?: number): Observable<StudentProfile[]> {
        let url = `${this.apiUrl}/students/search?q=${encodeURIComponent(query)}`;
        if (branch) url += `&branch=${encodeURIComponent(branch)}`;
        if (semester) url += `&semester=${semester}`;
        return this.http.get<StudentProfile[]>(url);
    }

    // Get student by ID
    getStudentById(userId: number): Observable<StudentProfile> {
        return this.http.get<StudentProfile>(`${this.apiUrl}/students/${userId}`);
    }
}
