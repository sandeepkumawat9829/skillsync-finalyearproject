import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Project, CollegeProjectBucket, CreateProjectRequest } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/projects';

    constructor(private http: HttpClient) { }

    // Get all public projects
    getProjects(filters?: any): Observable<Project[]> {
        let params = new HttpParams();
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params = params.set(key, filters[key]);
                }
            });
        }
        return this.http.get<Project[]>(`${this.apiUrl}/public`, { params });
    }

    // Get project by ID
    getProjectById(id: number, userId?: number): Observable<Project> {
        // userId likely unused by API, but component passes it. Is it needed?
        // If API supports it, we append query param? Or just ignore.
        // API: /api/projects/{id}
        // If userId logic handles permissions, backend might need it via query param or JWT token.
        // Assuming JWT handles identity, ignoring param for now.
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    // Create new project
    createProject(request: CreateProjectRequest): Observable<Project> {
        return this.http.post<Project>(`${this.apiUrl}`, request);
    }

    // Update project
    updateProject(id: number, request: Partial<CreateProjectRequest>): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}/${id}`, request);
    }

    // Delete project
    deleteProject(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Get college project buckets
    getProjectBuckets(): Observable<CollegeProjectBucket[]> {
        return this.http.get<CollegeProjectBucket[]>(`${this.apiUrl}/buckets`).pipe(
            catchError(() => of([]))  // Return empty array if buckets endpoint doesn't exist yet
        );
    }

    // Get my projects (created by current user)
    getMyProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/my`);
    }

    // Get projects by status
    getProjectsByStatus(status: string): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/status/${status}`);
    }
}
