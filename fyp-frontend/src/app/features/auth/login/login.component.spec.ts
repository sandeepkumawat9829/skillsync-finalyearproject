import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
                FormBuilder
            ]
        });

        component = new LoginComponent(
            formBuilder,
            routerSpy,
            TestBed.inject(ActivatedRoute),
            authServiceSpy,
            snackBarSpy
        );
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize with empty form', () => {
            expect(component.loginForm.get('email')?.value).toBe('');
            expect(component.loginForm.get('password')?.value).toBe('');
        });

        it('should have required validators', () => {
            expect(component.loginForm.get('email')?.hasError('required')).toBeTrue();
            expect(component.loginForm.get('password')?.hasError('required')).toBeTrue();
        });

        it('should validate email format', () => {
            component.loginForm.get('email')?.setValue('invalid');
            expect(component.loginForm.get('email')?.hasError('email')).toBeTrue();

            component.loginForm.get('email')?.setValue('valid@email.com');
            expect(component.loginForm.get('email')?.hasError('email')).toBeFalse();
        });

        it('should validate password minimum length', () => {
            component.loginForm.get('password')?.setValue('12345');
            expect(component.loginForm.get('password')?.hasError('minlength')).toBeTrue();

            component.loginForm.get('password')?.setValue('123456');
            expect(component.loginForm.get('password')?.hasError('minlength')).toBeFalse();
        });
    });

    describe('Form Submission', () => {
        it('should not submit if form is invalid', () => {
            component.onSubmit();
            expect(authServiceSpy.login).not.toHaveBeenCalled();
        });

        it('should call AuthService.login on valid form', () => {
            authServiceSpy.login.and.returnValue(of({
                token: 'test-token',
                type: 'Bearer',
                userId: 1,
                email: 'test@example.com',
                role: 'STUDENT',
                fullName: 'Test User'
            }));

            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'password123'
            });

            component.onSubmit();

            expect(authServiceSpy.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('should navigate to student dashboard on STUDENT login', () => {
            authServiceSpy.login.and.returnValue(of({
                token: 'test-token',
                type: 'Bearer',
                userId: 1,
                email: 'test@example.com',
                role: 'STUDENT',
                fullName: 'Test User'
            }));

            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'password123'
            });

            component.onSubmit();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/dashboard']);
        });

        it('should navigate to mentor dashboard on MENTOR login', () => {
            authServiceSpy.login.and.returnValue(of({
                token: 'test-token',
                type: 'Bearer',
                userId: 1,
                email: 'mentor@example.com',
                role: 'MENTOR',
                fullName: 'Test Mentor'
            }));

            component.loginForm.setValue({
                email: 'mentor@example.com',
                password: 'password123'
            });

            component.onSubmit();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/mentor/dashboard']);
        });

        it('should show success snackbar on successful login', () => {
            authServiceSpy.login.and.returnValue(of({
                token: 'test-token',
                type: 'Bearer',
                userId: 1,
                email: 'test@example.com',
                role: 'STUDENT',
                fullName: 'Test User'
            }));

            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'password123'
            });

            component.onSubmit();

            expect(snackBarSpy.open).toHaveBeenCalledWith(
                'Login successful!',
                'Close',
                jasmine.objectContaining({ duration: 3000 })
            );
        });

        it('should show error snackbar on failed login', () => {
            authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid')));

            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'wrong'
            });

            component.onSubmit();

            expect(snackBarSpy.open).toHaveBeenCalledWith(
                'Login failed. Please check your credentials.',
                'Close',
                jasmine.objectContaining({ duration: 3000 })
            );
        });

        it('should set loading to false after error', () => {
            authServiceSpy.login.and.returnValue(throwError(() => new Error('Error')));

            component.loginForm.setValue({
                email: 'test@example.com',
                password: 'password123'
            });

            component.onSubmit();

            expect(component.loading).toBeFalse();
        });
    });

    describe('Password Visibility', () => {
        it('should initialize with password hidden', () => {
            expect(component.hidePassword).toBeTrue();
        });
    });

    describe('Form Controls Getter', () => {
        it('should return form controls via f getter', () => {
            expect(component.f).toBe(component.loginForm.controls);
        });
    });
});
