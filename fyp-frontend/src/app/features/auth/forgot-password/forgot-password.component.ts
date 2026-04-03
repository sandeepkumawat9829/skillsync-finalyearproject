import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-forgot-password',
    template: `
        <div class="auth-container">
            <div class="auth-card-wrapper">
                <mat-card class="auth-card">
                    <mat-card-header>
                        <div class="header-content">
                            <div class="logo-container">
                                <img src="/assets/images/skillsync-logo.svg" alt="SkillSync" class="skillsync-logo" />
                            </div>
                            <h1>Reset your <span>password</span></h1>
                            <p>Enter your email and we'll send you a reset link</p>
                        </div>
                    </mat-card-header>

                    <mat-card-content>
                        <div *ngIf="!submitted">
                            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                                <mat-form-field appearance="outline" class="full-width">
                                    <mat-label>Email address</mat-label>
                                    <input matInput type="email" formControlName="email" placeholder="you@example.com">
                                    <mat-icon matPrefix>email_outline</mat-icon>
                                    <mat-error *ngIf="form.get('email')?.hasError('required')">Email is required</mat-error>
                                    <mat-error *ngIf="form.get('email')?.hasError('email')">Enter a valid email</mat-error>
                                </mat-form-field>

                                <button mat-raised-button color="primary" class="full-width login-button" type="submit"
                                    [disabled]="loading || form.invalid">
                                    <span *ngIf="!loading">Send Reset Link</span>
                                    <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
                                </button>
                            </form>
                        </div>

                        <div *ngIf="submitted" class="success-state">
                            <div class="state-icon success-bg">
                                <mat-icon class="state-icon-inner">mark_email_read</mat-icon>
                            </div>
                            <h2>Check your email</h2>
                            <p>If an account exists with that email, we've sent a password reset link. Please check your inbox and spam folder.</p>
                            <button mat-raised-button color="primary" routerLink="/auth/login" class="full-width login-button">
                                Back to Login
                            </button>
                        </div>

                        <div class="auth-footer">
                            <p>Remember your password?
                                <a routerLink="/auth/login" class="link">Sign in</a>
                            </p>
                        </div>
                    </mat-card-content>
                </mat-card>
            </div>
        </div>
    `,
    styles: [`
        .auth-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 40px 20px;
            background: #e8e7ff;
        }

        .auth-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image:
                radial-gradient(circle at 20% 20%, rgba(189, 186, 255, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255, 204, 77, 0.2) 0%, transparent 50%);
            z-index: 0;
        }

        .auth-card-wrapper {
            width: 100%;
            max-width: 480px;
            animation: slideUp 0.6s ease-out;
            position: relative;
            z-index: 1;
        }

        .auth-card {
            padding: 48px 40px;
            border-radius: 24px !important;
            background: white !important;
            box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08) !important;
            border: none !important;
        }

        .header-content {
            text-align: center;
            margin-bottom: 36px;
        }

        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }

        .skillsync-logo {
            height: 60px;
            width: auto;
            object-fit: contain;
        }

        .header-content h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 16px 0 8px 0;
            color: #1b1b1b;
        }

        .header-content h1 span {
            background: linear-gradient(135deg, #ff5754, #ff9a76);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-content p {
            font-size: 15px;
            color: #6b7280;
            font-weight: 500;
        }

        .full-width {
            width: 100%;
            margin-bottom: 20px;
        }

        ::ng-deep .mat-form-field .mat-form-field-outline {
            border-radius: 12px !important;
        }

        ::ng-deep .mat-form-field input {
            color: #1b1b1b;
            font-weight: 500;
            font-size: 15px;
        }

        .login-button {
            height: 52px;
            font-size: 16px;
            font-weight: 700;
            margin-top: 8px;
            margin-bottom: 24px;
            border-radius: 26px !important;
            background: #ff5754 !important;
            color: white !important;
            box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3) !important;
            transition: all 0.3s ease;
            text-transform: none !important;
        }

        .login-button:hover:not(:disabled) {
            background: #ff6b68 !important;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4) !important;
        }

        .login-button:disabled {
            opacity: 0.6;
            background: #d1d5db !important;
            box-shadow: none !important;
        }

        .success-state {
            text-align: center;
            padding: 24px 0;
        }

        .state-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }

        .success-bg {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
        }

        .state-icon-inner {
            font-size: 40px;
            width: 40px;
            height: 40px;
            color: #16a34a;
        }

        .success-state h2 {
            margin: 0 0 12px;
            font-size: 22px;
            font-weight: 700;
            color: #1b1b1b;
        }

        .success-state p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        .auth-footer {
            text-align: center;
            margin-top: 24px;
        }

        .auth-footer p {
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
        }

        .auth-footer .link {
            color: #ff5754;
            text-decoration: none;
            font-weight: 700;
            transition: color 0.2s ease;
        }

        .auth-footer .link:hover {
            color: #ff6b68;
            text-decoration: underline;
        }

        ::ng-deep mat-card-header {
            display: block !important;
            padding: 0 !important;
            margin-bottom: 32px !important;
        }

        mat-spinner {
            margin: 0 auto;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
            .auth-container { padding: 20px; }
            .auth-card { padding: 36px 28px; }
            .header-content h1 { font-size: 24px; }
        }
    `]
})
export class ForgotPasswordComponent {
    form: FormGroup;
    loading = false;
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.loading = true;

        this.http.post('/api/auth/forgot-password', { email: this.form.value.email }).subscribe({
            next: () => {
                this.loading = false;
                this.submitted = true;
            },
            error: (err) => {
                this.loading = false;
                // Still show success to prevent email enumeration
                this.submitted = true;
            }
        });
    }
}
