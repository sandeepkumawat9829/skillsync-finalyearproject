import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

export interface RegisterResponse {
    message: string;
    email: string;
    requiresVerification: boolean;
}

export interface VerifyResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    role: string;
    fullName: string;
}

export interface ResendOTPResponse {
    message: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/auth';
    private currentUserSubject: BehaviorSubject<User | null>;
    public currentUser: Observable<User | null>;

    constructor(private http: HttpClient) {
        const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');

        // Migrate older session-based auth to persistent storage so refresh/restart is stable.
        if (!localStorage.getItem('currentUser') && sessionStorage.getItem('currentUser')) {
            localStorage.setItem('currentUser', sessionStorage.getItem('currentUser')!);
        }
        if (!localStorage.getItem('token') && sessionStorage.getItem('token')) {
            localStorage.setItem('token', sessionStorage.getItem('token')!);
        }

        this.currentUserSubject = new BehaviorSubject<User | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    const user: User = {
                        userId: response.userId,
                        email: response.email,
                        role: response.role as 'STUDENT' | 'MENTOR' | 'ADMIN'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('token', response.token);
                    this.currentUserSubject.next(user);
                })
            );
    }

    register(data: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data)
            .pipe(
                tap(response => {
                    // Store email for verification page
                    if (response.requiresVerification) {
                        sessionStorage.setItem('verifyEmail', response.email);
                    }
                })
            );
    }

    verifyEmail(email: string, otp: string): Observable<VerifyResponse> {
        return this.http.post<VerifyResponse>(`${this.apiUrl}/verify-email`, { email, otp })
            .pipe(
                tap(response => {
                    const user: User = {
                        userId: response.userId,
                        email: response.email,
                        role: response.role as 'STUDENT' | 'MENTOR' | 'ADMIN'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('token', response.token);
                    this.currentUserSubject.next(user);
                })
            );
    }

    resendOTP(email: string): Observable<ResendOTPResponse> {
        return this.http.post<ResendOTPResponse>(`${this.apiUrl}/resend-otp`, { email });
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('verifyEmail');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getUserRole(): 'STUDENT' | 'MENTOR' | 'ADMIN' | null {
        const user = this.currentUserValue;
        return user ? user.role : null;
    }
}
