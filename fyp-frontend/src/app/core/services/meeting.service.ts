import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting, CreateMeetingRequest } from '../models/meeting.model';

@Injectable({
    providedIn: 'root'
})
export class MeetingService {
    private apiUrl = 'http://localhost:8080/api/meetings';

    constructor(private http: HttpClient) { }

    // Get all meetings for current user
    getAllMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.apiUrl}`);
    }

    // Get meetings by team
    getMeetingsByTeam(teamId: number): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.apiUrl}/team/${teamId}`);
    }

    // Get upcoming meetings
    getUpcomingMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.apiUrl}/upcoming`);
    }

    // Get past meetings
    getPastMeetings(): Observable<Meeting[]> {
        return this.http.get<Meeting[]>(`${this.apiUrl}/past`);
    }

    // Get meeting by ID
    getMeetingById(meetingId: number): Observable<Meeting> {
        return this.http.get<Meeting>(`${this.apiUrl}/${meetingId}`);
    }

    // Create meeting
    createMeeting(request: CreateMeetingRequest): Observable<Meeting> {
        return this.http.post<Meeting>(`${this.apiUrl}`, request);
    }

    // Update meeting
    updateMeeting(meetingId: number, meeting: Partial<Meeting>): Observable<Meeting> {
        return this.http.put<Meeting>(`${this.apiUrl}/${meetingId}`, meeting);
    }

    // Add meeting notes
    addMeetingNotes(meetingId: number, notes: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${meetingId}/notes`, { notes });
    }

    // Cancel meeting
    cancelMeeting(meetingId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${meetingId}`);
    }

    // Delete meeting
    deleteMeeting(meetingId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${meetingId}`);
    }

    // Download meeting as ICS calendar file
    downloadIcs(meetingId: number): void {
        window.open(`${this.apiUrl}/${meetingId}/ics`, '_blank');
    }
}
