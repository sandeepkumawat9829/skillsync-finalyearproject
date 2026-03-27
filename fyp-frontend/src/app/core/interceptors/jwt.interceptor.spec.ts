import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../services/auth.service';

describe('JwtInterceptor', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: JwtInterceptor,
                    multi: true
                },
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header when token exists', () => {
        authServiceSpy.getToken.and.returnValue('test-jwt-token');

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBeTrue();
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
        req.flush({});
    });

    it('should not add Authorization header when no token', () => {
        authServiceSpy.getToken.and.returnValue(null);

        httpClient.get('/api/test').subscribe();

        const req = httpMock.expectOne('/api/test');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('should logout and redirect on 401 error', () => {
        authServiceSpy.getToken.and.returnValue('expired-token');

        httpClient.get('/api/test').subscribe({
            error: (error: HttpErrorResponse) => {
                expect(error.status).toBe(401);
                expect(authServiceSpy.logout).toHaveBeenCalled();
                expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should not logout on non-401 errors', () => {
        authServiceSpy.getToken.and.returnValue('valid-token');

        httpClient.get('/api/test').subscribe({
            error: (error: HttpErrorResponse) => {
                expect(error.status).toBe(500);
                expect(authServiceSpy.logout).not.toHaveBeenCalled();
                expect(routerSpy.navigate).not.toHaveBeenCalled();
            }
        });

        const req = httpMock.expectOne('/api/test');
        req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should pass through successful responses', () => {
        authServiceSpy.getToken.and.returnValue('valid-token');
        const mockData = { message: 'Success' };

        httpClient.get('/api/test').subscribe(response => {
            expect(response).toEqual(mockData);
        });

        const req = httpMock.expectOne('/api/test');
        req.flush(mockData);
    });
});
