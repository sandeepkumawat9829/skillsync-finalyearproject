import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
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

    /**
     * In-memory token for WebSocket STOMP headers ONLY.
     * NOT stored in localStorage — HttpOnly cookie handles REST auth.
     */
    private wsToken: string | null = null;

    constructor(private http: HttpClient) {
        // Restore user info from localStorage (non-sensitive data)
        const storedUser = localStorage.getItem('currentUser');

        this.currentUserSubject = new BehaviorSubject<User | null>(
            storedUser ? JSON.parse(storedUser) : null
        );
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Called on app init / page refresh to restore session from HttpOnly cookie.
     * The cookie is sent automatically — backend reads it and returns user info.
     */
    fetchCurrentUser(): Observable<AuthResponse | null> {
        return this.http.get<AuthResponse>(`${this.apiUrl}/me`, { withCredentials: true })
            .pipe(
                tap(response => {
                    if (response) {
                        const user: User = {
                            userId: response.userId,
                            email: response.email,
                            role: response.role as 'STUDENT' | 'MENTOR' | 'ADMIN'
                        };
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        this.currentUserSubject.next(user);
                    }
                }),
                catchError(() => {
                    // Cookie expired or invalid — clear local state
                    localStorage.removeItem('currentUser');
                    this.currentUserSubject.next(null);
                    this.wsToken = null;
                    return of(null);
                })
            );
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
            .pipe(
                tap(response => {
                    const user: User = {
                        userId: response.userId,
                        email: response.email,
                        role: response.role as 'STUDENT' | 'MENTOR' | 'ADMIN'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    // Store token in memory only (for WebSocket STOMP headers)
                    this.wsToken = response.token;
                    this.currentUserSubject.next(user);
                })
            );
    }

    register(data: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data, { withCredentials: true })
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
        return this.http.post<VerifyResponse>(`${this.apiUrl}/verify-email`, { email, otp }, { withCredentials: true })
            .pipe(
                tap(response => {
                    const user: User = {
                        userId: response.userId,
                        email: response.email,
                        role: response.role as 'STUDENT' | 'MENTOR' | 'ADMIN'
                    };
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    // Store token in memory only (for WebSocket STOMP headers)
                    this.wsToken = response.token;
                    this.currentUserSubject.next(user);
                })
            );
    }

    resendOTP(email: string): Observable<ResendOTPResponse> {
        return this.http.post<ResendOTPResponse>(`${this.apiUrl}/resend-otp`, { email });
    }

    logout(): void {
        // Call backend to clear the HttpOnly cookie
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe();
        // Clear local state
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('verifyEmail');
        this.wsToken = null;
        this.currentUserSubject.next(null);
    }

    /**
     * Returns the in-memory JWT token for WebSocket STOMP header auth.
     * NOT for REST APIs — those use HttpOnly cookies automatically.
     */
    getToken(): string | null {
        return this.wsToken;
    }

    isAuthenticated(): boolean {
        return !!this.currentUserValue;
    }

    getUserRole(): 'STUDENT' | 'MENTOR' | 'ADMIN' | null {
        const user = this.currentUserValue;
        return user ? user.role : null;
    }
}
