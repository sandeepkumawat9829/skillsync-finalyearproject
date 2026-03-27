import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectBucket {
    bucketId?: number;
    title: string;
    description: string;
    department?: string;
    technologies?: string[];
    difficultyLevel: string;
    maxTeams?: number;
    allocatedTeams?: number;
    availableSlots?: number;
    isAvailable?: boolean;
    postedById?: number;
    postedByName?: string;
    postedAt?: string;
    deadline?: string;
}

@Injectable({
    providedIn: 'root'
})
export class BucketService {
    private apiUrl = 'http://localhost:8080/api/buckets';

    constructor(private http: HttpClient) { }

    getAvailableBuckets(): Observable<ProjectBucket[]> {
        return this.http.get<ProjectBucket[]>(this.apiUrl);
    }

    getAllBuckets(): Observable<ProjectBucket[]> {
        return this.http.get<ProjectBucket[]>(`${this.apiUrl}/all`);
    }

    getBucketsByDepartment(department: string): Observable<ProjectBucket[]> {
        return this.http.get<ProjectBucket[]>(`${this.apiUrl}/department/${department}`);
    }

    getBucketsByDifficulty(difficulty: string): Observable<ProjectBucket[]> {
        return this.http.get<ProjectBucket[]>(`${this.apiUrl}/difficulty/${difficulty}`);
    }

    getBucket(bucketId: number): Observable<ProjectBucket> {
        return this.http.get<ProjectBucket>(`${this.apiUrl}/${bucketId}`);
    }

    createBucket(bucket: ProjectBucket, userId: number): Observable<ProjectBucket> {
        return this.http.post<ProjectBucket>(`${this.apiUrl}?userId=${userId}`, bucket);
    }

    updateBucket(bucketId: number, bucket: ProjectBucket): Observable<ProjectBucket> {
        return this.http.put<ProjectBucket>(`${this.apiUrl}/${bucketId}`, bucket);
    }

    allocateTeam(bucketId: number): Observable<ProjectBucket> {
        return this.http.post<ProjectBucket>(`${this.apiUrl}/${bucketId}/allocate`, {});
    }

    deleteBucket(bucketId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${bucketId}`);
    }
}
