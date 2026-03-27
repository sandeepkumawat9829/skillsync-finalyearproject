import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
            currentUserValue: null
        });
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                AuthGuard,
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });

        guard = TestBed.inject(AuthGuard);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should be created', () => {
        expect(guard).toBeTruthy();
    });

    describe('canActivate', () => {
        let mockRoute: ActivatedRouteSnapshot;
        let mockState: RouterStateSnapshot;

        beforeEach(() => {
            mockRoute = { data: {} } as ActivatedRouteSnapshot;
            mockState = { url: '/test' } as RouterStateSnapshot;
        });

        it('should return false and redirect to login when not authenticated', () => {
            Object.defineProperty(authServiceSpy, 'currentUserValue', { value: null });

            const result = guard.canActivate(mockRoute, mockState);

            expect(result).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/test' } });
        });

        it('should return true when authenticated with no role requirement', () => {
            Object.defineProperty(authServiceSpy, 'currentUserValue', {
                value: { userId: 1, email: 'test@example.com', role: 'STUDENT' }
            });

            const result = guard.canActivate(mockRoute, mockState);

            expect(result).toBeTrue();
        });

        it('should return true when authenticated with matching role', () => {
            Object.defineProperty(authServiceSpy, 'currentUserValue', {
                value: { userId: 1, email: 'test@example.com', role: 'ADMIN' }
            });
            mockRoute.data = { role: 'ADMIN' };

            const result = guard.canActivate(mockRoute, mockState);

            expect(result).toBeTrue();
        });

        it('should return false and redirect when role does not match', () => {
            Object.defineProperty(authServiceSpy, 'currentUserValue', {
                value: { userId: 1, email: 'test@example.com', role: 'STUDENT' }
            });
            mockRoute.data = { role: 'ADMIN' };

            const result = guard.canActivate(mockRoute, mockState);

            expect(result).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/dashboard']);
        });

        it('should redirect mentor to mentor dashboard when accessing admin route', () => {
            Object.defineProperty(authServiceSpy, 'currentUserValue', {
                value: { userId: 1, email: 'mentor@example.com', role: 'MENTOR' }
            });
            mockRoute.data = { role: 'ADMIN' };

            const result = guard.canActivate(mockRoute, mockState);

            expect(result).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/mentor/dashboard']);
        });
    });
});
