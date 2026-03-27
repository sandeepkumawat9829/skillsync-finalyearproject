import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Announcement {
    announcementId?: number;
    postedById?: number;
    postedByName?: string;
    title: string;
    content: string;
    announcementType: string;
    targetAudience: string;
    isActive?: boolean;
    createdAt?: string;
    expiresAt?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private apiUrl = 'http://localhost:8080/api/announcements';

    constructor(private http: HttpClient) { }

    getActiveAnnouncements(audience: string = 'ALL'): Observable<Announcement[]> {
        return this.http.get<Announcement[]>(`${this.apiUrl}?audience=${audience}`);
    }

    getAllAnnouncements(): Observable<Announcement[]> {
        return this.http.get<Announcement[]>(`${this.apiUrl}/all`);
    }

    getImportantAnnouncements(): Observable<Announcement[]> {
        return this.http.get<Announcement[]>(`${this.apiUrl}/important`);
    }

    getAnnouncement(announcementId: number): Observable<Announcement> {
        return this.http.get<Announcement>(`${this.apiUrl}/${announcementId}`);
    }

    createAnnouncement(announcement: Announcement, userId: number): Observable<Announcement> {
        return this.http.post<Announcement>(`${this.apiUrl}?userId=${userId}`, announcement);
    }

    updateAnnouncement(announcementId: number, announcement: Announcement): Observable<Announcement> {
        return this.http.put<Announcement>(`${this.apiUrl}/${announcementId}`, announcement);
    }

    deleteAnnouncement(announcementId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${announcementId}`);
    }
}
