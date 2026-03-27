import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MeetingService } from './meeting.service';
import { Meeting, CreateMeetingRequest } from '../models/meeting.model';

describe('MeetingService', () => {
    let service: MeetingService;
    let httpMock: HttpTestingController;

    const mockMeeting: Meeting = {
        id: 1,
        teamId: 1,
        teamName: 'Team Alpha',
        mentorId: 1,
        mentorName: 'Dr. Smith',
        title: 'Weekly Standup',
        description: 'Weekly progress meeting',
        scheduledAt: new Date(),
        durationMinutes: 60,
        location: 'Room 101',
        meetingType: 'ONLINE',
        status: 'SCHEDULED',
        createdBy: 1
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MeetingService]
        });
        service = TestBed.inject(MeetingService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllMeetings', () => {
        it('should fetch all meetings', () => {
            service.getAllMeetings().subscribe(meetings => {
                expect(meetings.length).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings');
            expect(req.request.method).toBe('GET');
            req.flush([mockMeeting]);
        });
    });

    describe('getMeetingsByTeam', () => {
        it('should fetch meetings by team ID', () => {
            service.getMeetingsByTeam(1).subscribe(meetings => {
                expect(meetings[0].teamId).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/team/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockMeeting]);
        });
    });

    describe('getUpcomingMeetings', () => {
        it('should fetch upcoming meetings', () => {
            service.getUpcomingMeetings().subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/upcoming');
            expect(req.request.method).toBe('GET');
            req.flush([mockMeeting]);
        });
    });

    describe('getPastMeetings', () => {
        it('should fetch past meetings', () => {
            service.getPastMeetings().subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/past');
            expect(req.request.method).toBe('GET');
            req.flush([mockMeeting]);
        });
    });

    describe('getMeetingById', () => {
        it('should fetch meeting by ID', () => {
            service.getMeetingById(1).subscribe(meeting => {
                expect(meeting).toEqual(mockMeeting);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockMeeting);
        });
    });

    describe('createMeeting', () => {
        it('should send POST request to create meeting', () => {
            const request: CreateMeetingRequest = {
                teamId: 1,
                title: 'New Meeting',
                description: 'Description',
                meetingType: 'ONLINE',
                scheduledAt: new Date(),
                durationMinutes: 30
            };

            service.createMeeting(request).subscribe(result => {
                expect(result).toEqual(mockMeeting);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings');
            expect(req.request.method).toBe('POST');
            req.flush(mockMeeting);
        });
    });

    describe('updateMeeting', () => {
        it('should send PUT request to update meeting', () => {
            const updates = { title: 'Updated Meeting' };

            service.updateMeeting(1, updates).subscribe(result => {
                expect(result).toEqual(mockMeeting);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockMeeting);
        });
    });

    describe('addMeetingNotes', () => {
        it('should send POST request to add meeting notes', () => {
            service.addMeetingNotes(1, 'These are meeting notes').subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1/notes');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ notes: 'These are meeting notes' });
            req.flush(null);
        });
    });

    describe('cancelMeeting', () => {
        it('should send POST request to cancel meeting', () => {
            service.cancelMeeting(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1/cancel');
            expect(req.request.method).toBe('POST');
            req.flush(null);
        });
    });

    describe('deleteMeeting', () => {
        it('should send DELETE request', () => {
            service.deleteMeeting(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('downloadIcs', () => {
        it('should open ICS download URL', () => {
            spyOn(window, 'open');
            service.downloadIcs(1);
            expect(window.open).toHaveBeenCalledWith('https://outermost-leisha-noncoherently.ngrok-free.de/api/meetings/1/ics', '_blank');
        });
    });
});
