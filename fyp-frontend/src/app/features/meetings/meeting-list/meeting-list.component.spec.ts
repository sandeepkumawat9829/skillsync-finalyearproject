import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingListComponent } from './meeting-list.component';
import { MeetingService } from '../../../core/services/meeting.service';
import { Meeting } from '../../../core/models/meeting.model';

describe('MeetingListComponent', () => {
    let component: MeetingListComponent;
    let meetingServiceSpy: jasmine.SpyObj<MeetingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockMeetings: Meeting[] = [
        {
            id: 1,
            projectId: 1,
            title: 'Sprint Planning',
            description: 'Plan the sprint',
            scheduledAt: new Date(Date.now() + 86400000),
            duration: 60,
            status: 'SCHEDULED',
            organizedBy: 1,
            organizerName: 'John',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        meetingServiceSpy = jasmine.createSpyObj('MeetingService', [
            'getUpcomingMeetings', 'getPastMeetings', 'cancelMeeting'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        meetingServiceSpy.getUpcomingMeetings.and.returnValue(of(mockMeetings));
        meetingServiceSpy.getPastMeetings.and.returnValue(of([]));

        component = new MeetingListComponent(meetingServiceSpy, routerSpy, dialogSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load meetings on init', () => {
            component.ngOnInit();
            expect(meetingServiceSpy.getUpcomingMeetings).toHaveBeenCalled();
            expect(meetingServiceSpy.getPastMeetings).toHaveBeenCalled();
        });
    });

    describe('Navigation', () => {
        it('should navigate to meeting detail', () => {
            component.viewMeeting(1);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/meetings', 1]);
        });

        it('should navigate to create meeting', () => {
            component.createMeeting();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/meetings/create']);
        });
    });

    describe('getMeetingTypeIcon', () => {
        it('should return videocam for ONLINE', () => {
            expect(component.getMeetingTypeIcon('ONLINE')).toBe('videocam');
        });

        it('should return place for OFFLINE', () => {
            expect(component.getMeetingTypeIcon('OFFLINE')).toBe('place');
        });

        it('should return event for undefined', () => {
            expect(component.getMeetingTypeIcon(undefined)).toBe('event');
        });
    });

    describe('getMeetingTypeColor', () => {
        it('should return primary for ONLINE', () => {
            expect(component.getMeetingTypeColor('ONLINE')).toBe('primary');
        });

        it('should return accent for OFFLINE', () => {
            expect(component.getMeetingTypeColor('OFFLINE')).toBe('accent');
        });
    });

    describe('getStatusColor', () => {
        it('should return primary for SCHEDULED', () => {
            expect(component.getStatusColor('SCHEDULED')).toBe('primary');
        });

        it('should return accent for COMPLETED', () => {
            expect(component.getStatusColor('COMPLETED')).toBe('accent');
        });

        it('should return warn for CANCELLED', () => {
            expect(component.getStatusColor('CANCELLED')).toBe('warn');
        });
    });

    describe('isUpcoming', () => {
        it('should return true for future scheduled meeting', () => {
            const result = component.isUpcoming(mockMeetings[0]);
            expect(result).toBeTrue();
        });

        it('should return false for past meeting', () => {
            const pastMeeting = { ...mockMeetings[0], scheduledAt: new Date(Date.now() - 86400000) };
            const result = component.isUpcoming(pastMeeting);
            expect(result).toBeFalse();
        });
    });
});
