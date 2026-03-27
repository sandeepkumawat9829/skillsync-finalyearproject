import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GitHubCommit {
    commitId: number;
    projectId: number;
    commitHash: string;
    commitMessage: string;
    authorName: string;
    authorEmail: string;
    committedById?: number;
    committedByName?: string;
    committedAt: Date;
    linesAdded: number;
    linesDeleted: number;
    filesChanged: number;
    syncedAt: Date;
}

export interface AuthorStats {
    authorEmail: string;
    authorName?: string;
    commitCount: number;
    percentage: number;
}

export interface GitHubStats {
    totalCommits: number;
    totalLinesAdded: number;
    totalLinesDeleted: number;
    netLinesOfCode: number;
    topContributors: AuthorStats[];
    recentCommits: GitHubCommit[];
    repositoryUrl: string;
    lastSyncedAt?: string;
}

export interface SyncResult {
    success: boolean;
    newCommitsCount: number;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class GitHubService {
    private apiUrl = 'http://localhost:8080/api/github';

    constructor(private http: HttpClient) { }

    /**
     * Sync commits from GitHub
     */
    syncCommits(projectId: number): Observable<SyncResult> {
        return this.http.post<SyncResult>(`${this.apiUrl}/projects/${projectId}/sync`, {});
    }

    /**
     * Get GitHub stats for a project
     */
    getStats(projectId: number): Observable<GitHubStats> {
        return this.http.get<GitHubStats>(`${this.apiUrl}/projects/${projectId}/stats`);
    }

    /**
     * Get commits for a project
     */
    getCommits(projectId: number, page: number = 0, size: number = 20): Observable<GitHubCommit[]> {
        return this.http.get<GitHubCommit[]>(
            `${this.apiUrl}/projects/${projectId}/commits?page=${page}&size=${size}`
        );
    }
}
