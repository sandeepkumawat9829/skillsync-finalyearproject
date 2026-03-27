import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectShowcase {
    showcaseId: number;
    projectId: number;
    projectTitle: string;
    projectAbstract?: string;
    teamName?: string;
    teamMembers: string[];
    mentorName?: string;
    isPublished: boolean;
    academicYear?: string;
    demoVideoUrl?: string;
    presentationUrl?: string;
    liveDemoUrl?: string;
    githubUrl?: string;
    awards: string[];
    tags: string[];
    technologies: string[];
    viewsCount: number;
    likesCount: number;
    hasLiked: boolean;
    publishedAt?: Date;
}

export interface PublishRequest {
    academicYear?: string;
    demoVideoUrl?: string;
    presentationUrl?: string;
    liveDemoUrl?: string;
    githubUrl?: string;
    awards?: string[];
    tags?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ShowcaseService {
    private apiUrl = 'http://localhost:8080/api/showcase';

    constructor(private http: HttpClient) { }

    /**
     * Get public gallery
     */
    getGallery(page: number = 0, size: number = 12, sortBy: string = 'recent'): Observable<ProjectShowcase[]> {
        return this.http.get<ProjectShowcase[]>(`${this.apiUrl}?page=${page}&size=${size}&sortBy=${sortBy}`);
    }

    /**
     * Get single showcase
     */
    getShowcase(showcaseId: number): Observable<ProjectShowcase> {
        return this.http.get<ProjectShowcase>(`${this.apiUrl}/${showcaseId}`);
    }

    /**
     * Publish a project to showcase
     */
    publishProject(projectId: number, request: PublishRequest): Observable<ProjectShowcase> {
        return this.http.post<ProjectShowcase>(`${this.apiUrl}/projects/${projectId}/publish`, request);
    }

    /**
     * Toggle like
     */
    toggleLike(showcaseId: number): Observable<{ liked: boolean }> {
        return this.http.post<{ liked: boolean }>(`${this.apiUrl}/${showcaseId}/like`, {});
    }

    /**
     * Search showcases
     */
    search(query: string, page: number = 0, size: number = 12): Observable<ProjectShowcase[]> {
        return this.http.get<ProjectShowcase[]>(`${this.apiUrl}/search?q=${query}&page=${page}&size=${size}`);
    }
}
