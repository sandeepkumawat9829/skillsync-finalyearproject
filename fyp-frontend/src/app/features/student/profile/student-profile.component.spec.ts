import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StudentProfileComponent } from './student-profile.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

describe('StudentProfileComponent', () => {
    let component: StudentProfileComponent;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    const mockProfile = {
        userId: 1,
        email: 'student@example.com',
        fullName: 'John Doe',
        enrollmentNumber: 'EN001',
        branch: 'Computer Science',
        currentSemester: 6,
        cgpa: 8.5,
        skills: ['Angular', 'Java']
    };

    beforeEach(() => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['getStudentProfile', 'updateStudentProfile']);
        authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUserValue: { userId: 1 } });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        userServiceSpy.getStudentProfile.and.returnValue(of(mockProfile));
        userServiceSpy.updateStudentProfile.and.returnValue(of(mockProfile));

        component = new StudentProfileComponent(
            formBuilder, userServiceSpy, authServiceSpy, routerSpy, snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load profile on init', () => {
            component.ngOnInit();
            expect(userServiceSpy.getStudentProfile).toHaveBeenCalled();
        });
    });

    describe('Form', () => {
        it('should have profile form', () => {
            component.ngOnInit();
            expect(component.profileForm).toBeTruthy();
        });

        it('should enable editing', () => {
            component.isEditing = false;
            component.enableEditing();
            expect(component.isEditing).toBeTrue();
        });

        it('should cancel editing', () => {
            component.isEditing = true;
            component.cancelEditing();
            expect(component.isEditing).toBeFalse();
        });
    });

    describe('saveProfile', () => {
        it('should call updateStudentProfile', () => {
            component.ngOnInit();
            component.isEditing = true;
            component.saveProfile();
            expect(userServiceSpy.updateStudentProfile).toHaveBeenCalled();
        });
    });
});
