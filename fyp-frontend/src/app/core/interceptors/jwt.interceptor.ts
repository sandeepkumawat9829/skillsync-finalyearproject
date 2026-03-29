import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private router: Router) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add withCredentials so that HttpOnly cookies are sent automatically
        // No need to manually attach Authorization header — the cookie handles it
        request = request.clone({ withCredentials: true });

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // Token expired or invalid, logout and redirect to login
                    this.authService.logout();
                    this.router.navigate(['/auth/login']);
                }
                return throwError(() => error);
            })
        );
    }
}
