import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        component = new RegisterComponent(formBuilder, routerSpy, authServiceSpy, snackBarSpy);
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize account form with empty values', () => {
            expect(component.accountForm.get('email')?.value).toBe('');
            expect(component.accountForm.get('password')?.value).toBe('');
        });

        it('should default role to STUDENT', () => {
            expect(component.accountForm.get('role')?.value).toBe('STUDENT');
            expect(component.selectedRole).toBe('STUDENT');
        });

        it('should have branches array', () => {
            expect(component.branches.length).toBeGreaterThan(0);
        });

        it('should have semesters array', () => {
            expect(component.semesters).toEqual([5, 6, 7, 8]);
        });
    });

    describe('Account Form Validation', () => {
        it('should require email', () => {
            expect(component.accountForm.get('email')?.hasError('required')).toBeTrue();
        });

        it('should validate email format', () => {
            component.accountForm.get('email')?.setValue('invalid');
            expect(component.accountForm.get('email')?.hasError('email')).toBeTrue();

            component.accountForm.get('email')?.setValue('valid@email.com');
            expect(component.accountForm.get('email')?.hasError('email')).toBeFalse();
        });

        it('should require password with minimum 8 characters', () => {
            component.accountForm.get('password')?.setValue('1234567');
            expect(component.accountForm.get('password')?.hasError('minlength')).toBeTrue();

            component.accountForm.get('password')?.setValue('12345678');
            expect(component.accountForm.get('password')?.hasError('minlength')).toBeFalse();
        });

        it('should validate password match', () => {
            component.accountForm.get('password')?.setValue('password123');
            component.accountForm.get('confirmPassword')?.setValue('different');
            expect(component.accountForm.hasError('passwordMismatch')).toBeTrue();

            component.accountForm.get('confirmPassword')?.setValue('password123');
            expect(component.accountForm.hasError('passwordMismatch')).toBeFalse();
        });
    });

    describe('Role Selection', () => {
        it('should update selectedRole when role changes', () => {
            component.accountForm.get('role')?.setValue('MENTOR');
            expect(component.selectedRole).toBe('MENTOR');
        });
    });

    describe('Form Submission', () => {
        it('should not submit if account form is invalid', () => {
            component.onSubmit();
            expect(authServiceSpy.register).not.toHaveBeenCalled();
        });

        it('should call AuthService.register with correct data', () => {
            authServiceSpy.register.and.returnValue(of({
                message: 'Success',
                email: 'test@example.com',
                requiresVerification: true
            }));

            component.accountForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                role: 'STUDENT'
            });

            component.onSubmit();

            expect(authServiceSpy.register).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                role: 'STUDENT'
            });
        });

        it('should navigate to verify-email on success', () => {
            authServiceSpy.register.and.returnValue(of({
                message: 'Success',
                email: 'test@example.com',
                requiresVerification: true
            }));

            component.accountForm.setValue({
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                role: 'STUDENT'
            });

            component.onSubmit();

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['/auth/verify-email'],
                { queryParams: { email: 'test@example.com' } }
            );
        });

        it('should show error snackbar on failure', () => {
            authServiceSpy.register.and.returnValue(throwError(() => ({
                error: { message: 'Email already exists' }
            })));

            component.accountForm.setValue({
                email: 'existing@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                role: 'STUDENT'
            });

            component.onSubmit();

            expect(snackBarSpy.open).toHaveBeenCalled();
        });
    });

    describe('Password Visibility', () => {
        it('should initialize with passwords hidden', () => {
            expect(component.hidePassword).toBeTrue();
            expect(component.hideConfirmPassword).toBeTrue();
        });
    });
});
