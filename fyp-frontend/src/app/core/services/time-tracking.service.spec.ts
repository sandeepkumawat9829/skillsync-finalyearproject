import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TimeTrackingService } from './time-tracking.service';
import { TimeEntry, LogTimeRequest, TeamTimeReport } from '../models/time-entry.model';

describe('TimeTrackingService', () => {
    let service: TimeTrackingService;
    let httpMock: HttpTestingController;

    const mockTimeEntry: TimeEntry = {
        timeEntryId: 1,
        taskId: 1,
        taskTitle: 'Fix bug',
        userId: 1,
        userName: 'John Doe',
        projectId: 1,
        hours: 2.5,
        date: new Date(),
        description: 'Fixed login bug',
        createdAt: new Date()
    };

    const mockTeamTimeReport: TeamTimeReport = {
        projectId: 1,
        totalHours: 40,
        memberContributions: [],
        taskDistribution: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TimeTrackingService]
        });
        service = TestBed.inject(TimeTrackingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('logTime', () => {
        it('should send POST request to log time', () => {
            const request: LogTimeRequest = {
                taskId: 1,
                hours: 2.5,
                date: new Date(),
                description: 'Fixed bug'
            };

            service.logTime(request).subscribe(result => {
                expect(result).toEqual(mockTimeEntry);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries');
            expect(req.request.method).toBe('POST');
            req.flush(mockTimeEntry);
        });
    });

    describe('getMyTimeEntries', () => {
        it('should fetch time entries without date filters', () => {
            service.getMyTimeEntries().subscribe(entries => {
                expect(entries.length).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/my');
            expect(req.request.method).toBe('GET');
            req.flush([mockTimeEntry]);
        });
    });

    describe('getTimeEntriesByTask', () => {
        it('should fetch entries by task ID', () => {
            service.getTimeEntriesByTask(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/task/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockTimeEntry]);
        });
    });

    describe('getTotalHoursByTask', () => {
        it('should fetch total hours for task', () => {
            service.getTotalHoursByTask(1).subscribe(total => {
                expect(total).toBe(10.5);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/task/1/total');
            expect(req.request.method).toBe('GET');
            req.flush(10.5);
        });
    });

    describe('updateTimeEntry', () => {
        it('should send PUT request to update entry', () => {
            const updates: Partial<LogTimeRequest> = { hours: 3.0 };

            service.updateTimeEntry(1, updates).subscribe(result => {
                expect(result).toEqual(mockTimeEntry);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockTimeEntry);
        });
    });

    describe('deleteTimeEntry', () => {
        it('should send DELETE request', () => {
            service.deleteTimeEntry(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getWeeklyTimeEntries', () => {
        it('should fetch weekly time entries', () => {
            service.getWeeklyTimeEntries().subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/my/this-week');
            expect(req.request.method).toBe('GET');
            req.flush([mockTimeEntry]);
        });
    });

    describe('getWeeklyTotalHours', () => {
        it('should fetch weekly total hours', () => {
            service.getWeeklyTotalHours().subscribe(result => {
                expect(result.totalHours).toBe(15);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/my/this-week/total');
            expect(req.request.method).toBe('GET');
            req.flush({ totalHours: 15 });
        });
    });

    describe('getTeamTimeReport', () => {
        it('should fetch team time report', () => {
            service.getTeamTimeReport(1, 'week').subscribe(report => {
                expect(report).toEqual(mockTeamTimeReport);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/time-entries/team/1?period=week');
            expect(req.request.method).toBe('GET');
            req.flush(mockTeamTimeReport);
        });
    });

    describe('getTodayHours', () => {
        it('should return 0 as fallback', () => {
            service.getTodayHours(1).subscribe(hours => {
                expect(hours).toBe(0);
            });
        });
    });

    describe('formatHours', () => {
        it('should format hours correctly', () => {
            expect(service.formatHours(2.5)).toBe('2.5h');
            expect(service.formatHours(10)).toBe('10.0h');
            expect(service.formatHours(0)).toBe('0.0h');
        });
    });
});
