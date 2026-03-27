import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingDetailComponent } from './meeting-detail.component';
import { MeetingService } from '../../../core/services/meeting.service';

describe('MeetingDetailComponent', () => {
    let component: MeetingDetailComponent;
    let meetingServiceSpy: jasmine.SpyObj<MeetingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockMeeting = {
        id: 1,
        projectId: 1,
        title: 'Sprint Review',
        description: 'Review sprint progress',
        scheduledAt: new Date(),
        duration: 60,
        status: 'SCHEDULED',
        organizedBy: 1,
        organizerName: 'John',
        meetingLink: 'https://meet.example.com/123',
        createdAt: new Date()
    };

    beforeEach(() => {
        meetingServiceSpy = jasmine.createSpyObj('MeetingService', [
            'getMeetingById', 'cancelMeeting'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        meetingServiceSpy.getMeetingById.and.returnValue(of(mockMeeting));

        const mockActivatedRoute = {
            params: of({ id: 1 }),
            snapshot: { paramMap: { get: () => '1' } }
        } as any;

        component = new MeetingDetailComponent(
            mockActivatedRoute, meetingServiceSpy, routerSpy, snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load meeting on init', () => {
            component.ngOnInit();
            expect(meetingServiceSpy.getMeetingById).toHaveBeenCalled();
        });

        it('should set meeting data', () => {
            component.ngOnInit();
            expect(component.meeting?.title).toBe('Sprint Review');
        });
    });

    describe('goBack', () => {
        it('should navigate to meetings', () => {
            component.goBack();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/meetings']);
        });
    });
});
