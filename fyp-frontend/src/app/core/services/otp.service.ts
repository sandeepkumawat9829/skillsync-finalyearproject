import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OtpRequestResponse {
    message: string;
    email: string;
    action: string;
    expiresInMinutes: number;
}

export interface OtpVerifyResponse {
    valid: boolean;
    message?: string;
    error?: string;
}

export interface OtpStatusResponse {
    action: string;
    pending: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OtpService {
    private apiUrl = 'http://localhost:8080/api/otp';

    // Supported actions
    static readonly ACTIONS = {
        PROJECT_SUBMIT: 'PROJECT_SUBMIT',
        MENTOR_REQUEST: 'MENTOR_REQUEST',
        TEAM_DELETE: 'TEAM_DELETE',
        PROFILE_UPDATE: 'PROFILE_UPDATE'
    };

    constructor(private http: HttpClient) { }

    /**
     * Request OTP for a sensitive action
     */
    requestOtp(action: string): Observable<OtpRequestResponse> {
        return this.http.post<OtpRequestResponse>(`${this.apiUrl}/request`, { action });
    }

    /**
     * Verify OTP for a sensitive action
     */
    verifyOtp(action: string, otp: string): Observable<OtpVerifyResponse> {
        return this.http.post<OtpVerifyResponse>(`${this.apiUrl}/verify`, { action, otp });
    }

    /**
     * Check if OTP is pending for an action
     */
    checkOtpStatus(action: string): Observable<OtpStatusResponse> {
        return this.http.get<OtpStatusResponse>(`${this.apiUrl}/status`, {
            params: { action }
        });
    }

    /**
     * Cancel a pending OTP
     */
    cancelOtp(action: string): Observable<{ message: string; action: string }> {
        return this.http.delete<{ message: string; action: string }>(`${this.apiUrl}/cancel`, {
            params: { action }
        });
    }
}
