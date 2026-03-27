import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OtpService, OtpRequestResponse, OtpVerifyResponse, OtpStatusResponse } from './otp.service';

describe('OtpService', () => {
    let service: OtpService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OtpService]
        });
        service = TestBed.inject(OtpService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have defined ACTIONS constants', () => {
        expect(OtpService.ACTIONS.PROJECT_SUBMIT).toBe('PROJECT_SUBMIT');
        expect(OtpService.ACTIONS.MENTOR_REQUEST).toBe('MENTOR_REQUEST');
        expect(OtpService.ACTIONS.TEAM_DELETE).toBe('TEAM_DELETE');
        expect(OtpService.ACTIONS.PROFILE_UPDATE).toBe('PROFILE_UPDATE');
    });

    describe('requestOtp', () => {
        it('should send POST request to request OTP', () => {
            const response: OtpRequestResponse = {
                message: 'OTP sent successfully',
                email: 'test@example.com',
                action: 'PROJECT_SUBMIT',
                expiresInMinutes: 10
            };

            service.requestOtp('PROJECT_SUBMIT').subscribe(result => {
                expect(result).toEqual(response);
                expect(result.expiresInMinutes).toBe(10);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/otp/request');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ action: 'PROJECT_SUBMIT' });
            req.flush(response);
        });
    });

    describe('verifyOtp', () => {
        it('should send POST request to verify OTP', () => {
            const response: OtpVerifyResponse = {
                valid: true,
                message: 'OTP verified successfully'
            };

            service.verifyOtp('PROJECT_SUBMIT', '123456').subscribe(result => {
                expect(result.valid).toBeTrue();
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/otp/verify');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ action: 'PROJECT_SUBMIT', otp: '123456' });
            req.flush(response);
        });

        it('should handle invalid OTP', () => {
            const response: OtpVerifyResponse = {
                valid: false,
                error: 'Invalid OTP'
            };

            service.verifyOtp('PROJECT_SUBMIT', '000000').subscribe(result => {
                expect(result.valid).toBeFalse();
                expect(result.error).toBe('Invalid OTP');
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/otp/verify');
            req.flush(response);
        });
    });

    describe('checkOtpStatus', () => {
        it('should fetch OTP status', () => {
            const response: OtpStatusResponse = {
                action: 'PROJECT_SUBMIT',
                pending: true
            };

            service.checkOtpStatus('PROJECT_SUBMIT').subscribe(result => {
                expect(result.pending).toBeTrue();
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/otp/status?action=PROJECT_SUBMIT');
            expect(req.request.method).toBe('GET');
            req.flush(response);
        });
    });

    describe('cancelOtp', () => {
        it('should send DELETE request to cancel OTP', () => {
            const response = { message: 'OTP cancelled', action: 'PROJECT_SUBMIT' };

            service.cancelOtp('PROJECT_SUBMIT').subscribe(result => {
                expect(result).toEqual(response);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/otp/cancel?action=PROJECT_SUBMIT');
            expect(req.request.method).toBe('DELETE');
            req.flush(response);
        });
    });
});
