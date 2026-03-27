import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntry, TimeReport, TeamTimeReport, LogTimeRequest, ReportPeriod } from '../models/time-entry.model';

@Injectable({
    providedIn: 'root'
})
export class TimeTrackingService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/time-entries';

    constructor(private http: HttpClient) { }

    // Log new time entry
    logTime(request: LogTimeRequest): Observable<TimeEntry> {
        return this.http.post<TimeEntry>(`${this.apiUrl}`, request);
    }

    // Get time entries for current user
    getMyTimeEntries(startDate?: Date, endDate?: Date): Observable<TimeEntry[]> {
        let url = `${this.apiUrl}/my`;
        const params: string[] = [];
        if (startDate) params.push(`startDate=${startDate.toISOString()}`);
        if (endDate) params.push(`endDate=${endDate.toISOString()}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        return this.http.get<TimeEntry[]>(url);
    }

    // Get entries by task
    getTimeEntriesByTask(taskId: number): Observable<TimeEntry[]> {
        return this.http.get<TimeEntry[]>(`${this.apiUrl}/task/${taskId}`);
    }

    // Get total hours for task
    getTotalHoursByTask(taskId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/task/${taskId}/total`);
    }

    // Update time entry
    updateTimeEntry(timeEntryId: number, request: Partial<LogTimeRequest>): Observable<TimeEntry> {
        return this.http.put<TimeEntry>(`${this.apiUrl}/${timeEntryId}`, request);
    }

    // Delete time entry
    deleteTimeEntry(timeEntryId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${timeEntryId}`);
    }

    // Get user time entries for the week - returns actual entries instead of report
    getWeeklyTimeEntries(): Observable<TimeEntry[]> {
        return this.http.get<TimeEntry[]>(`${this.apiUrl}/my/this-week`);
    }

    // Get weekly total hours
    getWeeklyTotalHours(): Observable<{ totalHours: number }> {
        return this.http.get<{ totalHours: number }>(`${this.apiUrl}/my/this-week/total`);
    }

    // Legacy method - now calls getWeeklyTimeEntries
    getUserTimeReport(period: ReportPeriod = 'week'): Observable<TimeEntry[]> {
        if (period === 'week') {
            return this.getWeeklyTimeEntries();
        }
        return this.getMyTimeEntries();
    }

    // Get entries for current user
    getTimeEntries(): Observable<TimeEntry[]> {
        return this.getMyTimeEntries();
    }

    getTodayHours(userId: number): Observable<number> {
        // Mock or implement endpoint
        // return this.http.get<number>(`${this.apiUrl}/user/${userId}/today`);
        // Fallback to 0 for now to fix build
        return new Observable(observer => {
            observer.next(0);
            observer.complete();
        });
    }

    // Get team time report  
    getTeamTimeReport(projectId: number, period: ReportPeriod = 'week'): Observable<TeamTimeReport> {
        return this.http.get<TeamTimeReport>(`${this.apiUrl}/team/${projectId}?period=${period}`);
    }

    // Format hours for display
    formatHours(hours: number): string {
        return `${hours.toFixed(1)}h`;
    }
}
