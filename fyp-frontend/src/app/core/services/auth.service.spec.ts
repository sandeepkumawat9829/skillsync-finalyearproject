import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, RegisterResponse, VerifyResponse, ResendOTPResponse } from './auth.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockAuthResponse: AuthResponse = {
        token: 'test-jwt-token',
        type: 'Bearer',
        userId: 1,
        email: 'test@example.com',
        role: 'STUDENT',
        fullName: 'Test User'
    };

    const mockRegisterResponse: RegisterResponse = {
        message: 'Registration successful',
        email: 'test@example.com',
        requiresVerification: true
    };

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        sessionStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });
        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should send POST request to login endpoint', () => {
            const credentials: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            service.login(credentials).subscribe(response => {
                expect(response).toEqual(mockAuthResponse);
                expect(localStorage.getItem('token')).toBe('test-jwt-token');
                expect(localStorage.getItem('currentUser')).toBeTruthy();
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/login');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(credentials);
            req.flush(mockAuthResponse);
        });

        it('should store user in localStorage after successful login', () => {
            const credentials: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            service.login(credentials).subscribe(() => {
                const storedUser = JSON.parse(localStorage.getItem('currentUser')!);
                expect(storedUser.userId).toBe(1);
                expect(storedUser.email).toBe('test@example.com');
                expect(storedUser.role).toBe('STUDENT');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/login');
            req.flush(mockAuthResponse);
        });

        it('should update currentUserSubject after login', () => {
            const credentials: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            service.login(credentials).subscribe(() => {
                const currentUser = service.currentUserValue;
                expect(currentUser).toBeTruthy();
                expect(currentUser?.email).toBe('test@example.com');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/login');
            req.flush(mockAuthResponse);
        });
    });

    describe('register', () => {
        it('should send POST request to register endpoint', () => {
            const registerData: RegisterRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                fullName: 'New User',
                role: 'STUDENT'
            };

            service.register(registerData).subscribe(response => {
                expect(response).toEqual(mockRegisterResponse);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/register');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(registerData);
            req.flush(mockRegisterResponse);
        });

        it('should store email in sessionStorage when verification is required', () => {
            const registerData: RegisterRequest = {
                email: 'newuser@example.com',
                password: 'password123',
                fullName: 'New User',
                role: 'STUDENT'
            };

            const newUserRegisterResponse: RegisterResponse = {
                message: 'Registration successful',
                email: 'newuser@example.com',
                requiresVerification: true
            };

            service.register(registerData).subscribe(() => {
                expect(sessionStorage.getItem('verifyEmail')).toBe('newuser@example.com');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/register');
            req.flush(newUserRegisterResponse);
        });
    });

    describe('verifyEmail', () => {
        it('should send POST request to verify-email endpoint', () => {
            const verifyResponse: VerifyResponse = {
                token: 'test-token',
                type: 'Bearer',
                userId: 1,
                email: 'test@example.com',
                role: 'STUDENT',
                fullName: 'Test User'
            };

            service.verifyEmail('test@example.com', '123456').subscribe(response => {
                expect(response).toEqual(verifyResponse);
                expect(localStorage.getItem('token')).toBe('test-token');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/verify-email');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ email: 'test@example.com', otp: '123456' });
            req.flush(verifyResponse);
        });
    });

    describe('resendOTP', () => {
        it('should send POST request to resend-otp endpoint', () => {
            const resendResponse: ResendOTPResponse = {
                message: 'OTP sent successfully',
                email: 'test@example.com'
            };

            service.resendOTP('test@example.com').subscribe(response => {
                expect(response).toEqual(resendResponse);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/resend-otp');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ email: 'test@example.com' });
            req.flush(resendResponse);
        });
    });

    describe('logout', () => {
        it('should clear localStorage and sessionStorage', () => {
            localStorage.setItem('currentUser', JSON.stringify({ userId: 1 }));
            localStorage.setItem('token', 'test-token');
            sessionStorage.setItem('verifyEmail', 'test@example.com');

            service.logout();

            expect(localStorage.getItem('currentUser')).toBeNull();
            expect(localStorage.getItem('token')).toBeNull();
            expect(sessionStorage.getItem('verifyEmail')).toBeNull();
        });

        it('should set currentUserSubject to null', () => {
            service.logout();
            expect(service.currentUserValue).toBeNull();
        });
    });

    describe('getToken', () => {
        it('should return token from localStorage', () => {
            localStorage.setItem('token', 'test-jwt-token');
            expect(service.getToken()).toBe('test-jwt-token');
        });

        it('should return null if no token exists', () => {
            expect(service.getToken()).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        it('should return true if token exists', () => {
            localStorage.setItem('token', 'test-token');
            expect(service.isAuthenticated()).toBeTrue();
        });

        it('should return false if no token exists', () => {
            expect(service.isAuthenticated()).toBeFalse();
        });
    });

    describe('getUserRole', () => {
        it('should return user role if user is logged in', () => {
            const credentials: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            service.login(credentials).subscribe(() => {
                expect(service.getUserRole()).toBe('STUDENT');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/auth/login');
            req.flush(mockAuthResponse);
        });

        it('should return null if no user is logged in', () => {
            expect(service.getUserRole()).toBeNull();
        });
    });
});
