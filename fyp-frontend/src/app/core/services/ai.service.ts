import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentSuggestion {
    id: number;
    userId: number;
    fullName: string;
    enrollmentNumber?: string;
    branch?: string;
    currentSemester?: number;
    skills: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    matchScore: number;
}

export interface PlagiarismResult {
    projectId: number;
    similarityScore: number;
    similarProjects: SimilarProject[];
    status: 'HIGH_SIMILARITY' | 'MODERATE_SIMILARITY' | 'LOW_SIMILARITY' | 'NO_ABSTRACT';
}

export interface SimilarProject {
    projectId: number;
    projectTitle: string;
    similarity: number;
}

@Injectable({
    providedIn: 'root'
})
export class AIService {
    private apiUrl = 'http://localhost:8080/api/ai';

    constructor(private http: HttpClient) { }

    /**
     * Get AI-suggested team members based on project requirements
     */
    suggestTeamMembers(projectId: number, limit: number = 10): Observable<StudentSuggestion[]> {
        return this.http.get<StudentSuggestion[]>(
            `${this.apiUrl}/projects/${projectId}/suggest-members?limit=${limit}`
        );
    }

    /**
     * Check project abstract for plagiarism/similarity
     */
    checkPlagiarism(projectId: number): Observable<PlagiarismResult> {
        return this.http.get<PlagiarismResult>(`${this.apiUrl}/projects/${projectId}/plagiarism-check`);
    }
}
