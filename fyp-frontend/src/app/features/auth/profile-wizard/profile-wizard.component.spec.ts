import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProfileWizardComponent } from './profile-wizard.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

describe('ProfileWizardComponent', () => {
    let component: ProfileWizardComponent;
    let userServiceSpy: jasmine.SpyObj<UserService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        userServiceSpy = jasmine.createSpyObj('UserService', ['completeProfile']);
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            currentUserValue: { userId: 1, email: 'test@example.com', role: 'STUDENT' }
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        userServiceSpy.completeProfile.and.returnValue(of({ message: 'Profile completed' }));

        component = new ProfileWizardComponent(
            formBuilder, userServiceSpy, authServiceSpy, routerSpy, snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should initialize with step 0', () => {
            expect(component.currentStep).toBe(0);
        });

        it('should have steps array', () => {
            expect(component.steps.length).toBeGreaterThan(0);
        });
    });

    describe('Navigation', () => {
        it('should go to next step', () => {
            component.currentStep = 0;
            component.nextStep();
            expect(component.currentStep).toBe(1);
        });

        it('should go to previous step', () => {
            component.currentStep = 1;
            component.previousStep();
            expect(component.currentStep).toBe(0);
        });

        it('should not go below step 0', () => {
            component.currentStep = 0;
            component.previousStep();
            expect(component.currentStep).toBe(0);
        });
    });
});
