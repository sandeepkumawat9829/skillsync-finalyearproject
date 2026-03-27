import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SharedResource {
    resourceId?: number;
    sharedById?: number;
    sharedByName?: string;
    teamId?: number;
    resourceTitle: string;
    resourceType: 'ARTICLE' | 'RESEARCH_PAPER' | 'TUTORIAL' | 'VIDEO' | 'TOOL' | 'OTHER';
    resourceUrl?: string;
    description?: string;
    projectPhase?: 'PLANNING' | 'DESIGN' | 'DEVELOPMENT' | 'TESTING';
    createdAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ResourceService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/resources';

    constructor(private http: HttpClient) { }

    /**
     * Create a new shared resource
     */
    createResource(resource: SharedResource): Observable<SharedResource> {
        return this.http.post<SharedResource>(this.apiUrl, resource);
    }

    /**
     * Get resources for a team
     */
    getTeamResources(teamId: number, type?: string, phase?: string): Observable<SharedResource[]> {
        let url = `${this.apiUrl}/teams/${teamId}`;
        const params: string[] = [];
        if (type) params.push(`type=${type}`);
        if (phase) params.push(`phase=${phase}`);
        if (params.length > 0) url += '?' + params.join('&');
        return this.http.get<SharedResource[]>(url);
    }

    /**
     * Delete a resource
     */
    deleteResource(resourceId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${resourceId}`);
    }
}
