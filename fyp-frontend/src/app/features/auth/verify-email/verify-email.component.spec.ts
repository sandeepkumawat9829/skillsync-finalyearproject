import { of, throwError } from 'rxjs';
import { VerifyEmailComponent } from './verify-email.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('VerifyEmailComponent', () => {
    let component: VerifyEmailComponent;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['verifyEmail', 'resendOTP']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        const mockActivatedRoute = {
            queryParams: of({ email: 'test@example.com' })
        } as any;

        component = new VerifyEmailComponent(authServiceSpy, routerSpy, mockActivatedRoute);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should set email from query params', () => {
            component.ngOnInit();
            expect(component.email).toBe('test@example.com');
        });

        it('should initialize with empty OTP values', () => {
            expect(component.otpValues).toEqual(['', '', '', '', '', '']);
        });

        it('should initialize countdown to 60', () => {
            expect(component.countdown).toBe(60);
        });
    });

    describe('canSubmit', () => {
        it('should return false when OTP is incomplete', () => {
            component.otpValues = ['1', '2', '3', '', '', ''];
            expect(component.canSubmit).toBeFalse();
        });

        it('should return true when OTP is complete', () => {
            component.otpValues = ['1', '2', '3', '4', '5', '6'];
            expect(component.canSubmit).toBeTrue();
        });
    });

    describe('getOtpCode', () => {
        it('should return joined OTP values', () => {
            component.otpValues = ['1', '2', '3', '4', '5', '6'];
            expect(component.getOtpCode()).toBe('123456');
        });
    });

    describe('verifyOTP', () => {
        it('should not verify when canSubmit is false', () => {
            component.otpValues = ['1', '2', '', '', '', ''];
            component.verifyOTP();
            expect(authServiceSpy.verifyEmail).not.toHaveBeenCalled();
        });

        it('should call verifyEmail when OTP is complete', () => {
            authServiceSpy.verifyEmail.and.returnValue(of({ message: 'Success' }));
            component.email = 'test@example.com';
            component.otpValues = ['1', '2', '3', '4', '5', '6'];
            component.verifyOTP();
            expect(authServiceSpy.verifyEmail).toHaveBeenCalledWith('test@example.com', '123456');
        });

        it('should set success message on success', () => {
            authServiceSpy.verifyEmail.and.returnValue(of({ message: 'Success' }));
            component.email = 'test@example.com';
            component.otpValues = ['1', '2', '3', '4', '5', '6'];
            component.verifyOTP();
            expect(component.successMessage).toBe('Email verified successfully!');
        });

        it('should set error message on failure', () => {
            authServiceSpy.verifyEmail.and.returnValue(throwError(() => ({ error: { message: 'Invalid OTP' } })));
            component.email = 'test@example.com';
            component.otpValues = ['1', '2', '3', '4', '5', '6'];
            component.verifyOTP();
            expect(component.errorMessage).toBe('Invalid OTP');
        });
    });

    describe('resendOTP', () => {
        it('should call resendOTP service', () => {
            authServiceSpy.resendOTP.and.returnValue(of({ message: 'Sent' }));
            component.email = 'test@example.com';
            component.resendOTP();
            expect(authServiceSpy.resendOTP).toHaveBeenCalledWith('test@example.com');
        });

        it('should set success message on resend', () => {
            authServiceSpy.resendOTP.and.returnValue(of({ message: 'Sent' }));
            component.email = 'test@example.com';
            component.resendOTP();
            expect(component.successMessage).toBe('A new code has been sent to your email.');
        });
    });

    describe('startCountdown', () => {
        it('should reset countdown to 60', () => {
            component.countdown = 30;
            component.startCountdown();
            expect(component.countdown).toBe(60);
        });
    });

    describe('Cleanup', () => {
        it('should not throw on ngOnDestroy', () => {
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });
});
