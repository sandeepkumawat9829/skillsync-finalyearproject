import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorRequestsComponent } from './mentor-requests.component';
import { MentorService } from '../../../core/services/mentor.service';

describe('MentorRequestsComponent', () => {
    let component: MentorRequestsComponent;
    let mentorServiceSpy: jasmine.SpyObj<MentorService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockRequests = [
        {
            requestId: 1,
            teamId: 1,
            teamName: 'Team Alpha',
            projectTitle: 'AI Project',
            status: 'PENDING',
            requestedAt: new Date()
        }
    ];

    beforeEach(() => {
        mentorServiceSpy = jasmine.createSpyObj('MentorService', [
            'getPendingMentorRequests', 'approveMentorRequest', 'rejectMentorRequest'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        mentorServiceSpy.getPendingMentorRequests.and.returnValue(of(mockRequests));
        mentorServiceSpy.approveMentorRequest.and.returnValue(of({ message: 'Approved' }));
        mentorServiceSpy.rejectMentorRequest.and.returnValue(of({ message: 'Rejected' }));

        component = new MentorRequestsComponent(mentorServiceSpy, routerSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load requests on init', () => {
            component.ngOnInit();
            expect(mentorServiceSpy.getPendingMentorRequests).toHaveBeenCalled();
        });

        it('should populate requests array', () => {
            component.ngOnInit();
            expect(component.requests.length).toBe(1);
        });
    });

    describe('approveRequest', () => {
        it('should call approveMentorRequest service', () => {
            component.approveRequest(1);
            expect(mentorServiceSpy.approveMentorRequest).toHaveBeenCalledWith(1);
        });
    });

    describe('rejectRequest', () => {
        it('should call rejectMentorRequest service', () => {
            component.rejectRequest(1);
            expect(mentorServiceSpy.rejectMentorRequest).toHaveBeenCalledWith(1);
        });
    });

    describe('getStatusClass', () => {
        it('should return pending for PENDING', () => {
            expect(component.getStatusClass('PENDING')).toBe('pending');
        });

        it('should return approved for APPROVED', () => {
            expect(component.getStatusClass('APPROVED')).toBe('approved');
        });
    });
});
