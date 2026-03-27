import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingCreateComponent } from './meeting-create.component';
import { MeetingService } from '../../../core/services/meeting.service';

describe('MeetingCreateComponent', () => {
    let component: MeetingCreateComponent;
    let meetingServiceSpy: jasmine.SpyObj<MeetingService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        meetingServiceSpy = jasmine.createSpyObj('MeetingService', ['createMeeting']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        meetingServiceSpy.createMeeting.and.returnValue(of({
            id: 1,
            projectId: 1,
            title: 'Test Meeting',
            scheduledAt: new Date(),
            duration: 60,
            status: 'SCHEDULED',
            organizedBy: 1,
            createdAt: new Date()
        }));

        component = new MeetingCreateComponent(
            formBuilder, meetingServiceSpy, routerSpy, snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize meeting form', () => {
            component.ngOnInit();
            expect(component.meetingForm).toBeTruthy();
        });

        it('should have title field', () => {
            component.ngOnInit();
            expect(component.meetingForm.get('title')).toBeTruthy();
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should require title', () => {
            expect(component.meetingForm.get('title')?.hasError('required')).toBeTrue();
        });
    });

    describe('cancel', () => {
        it('should navigate back to meetings', () => {
            component.cancel();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/meetings']);
        });
    });
});
