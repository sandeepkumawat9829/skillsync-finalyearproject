import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-reset-password',
    template: `
        <div class="auth-container">
            <div class="auth-card-wrapper">
                <mat-card class="auth-card">
                    <mat-card-header>
                        <div class="header-content">
                            <div class="logo-container">
                                <img src="/assets/images/skillsync-logo.svg" alt="SkillSync" class="skillsync-logo" />
                            </div>
                            <h1>Set new <span>password</span></h1>
                            <p>Enter your new password below</p>
                        </div>
                    </mat-card-header>

                    <mat-card-content>
                        <div *ngIf="!success && !invalidToken">
                            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                                <mat-form-field appearance="outline" class="full-width">
                                    <mat-label>New Password</mat-label>
                                    <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword"
                                        placeholder="Enter new password">
                                    <mat-icon matPrefix>lock_outline</mat-icon>
                                    <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                                        <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                                    </button>
                                    <mat-error *ngIf="form.get('newPassword')?.hasError('required')">Password is required</mat-error>
                                    <mat-error *ngIf="form.get('newPassword')?.hasError('minlength')">Minimum 6 characters</mat-error>
                                </mat-form-field>

                                <mat-form-field appearance="outline" class="full-width">
                                    <mat-label>Confirm Password</mat-label>
                                    <input matInput [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword"
                                        placeholder="Confirm new password">
                                    <mat-icon matPrefix>lock_outline</mat-icon>
                                    <button mat-icon-button matSuffix (click)="hideConfirm = !hideConfirm" type="button">
                                        <mat-icon>{{hideConfirm ? 'visibility_off' : 'visibility'}}</mat-icon>
                                    </button>
                                    <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">Confirm your password</mat-error>
                                </mat-form-field>

                                <div *ngIf="passwordMismatch" class="error-text">
                                    Passwords do not match
                                </div>

                                <button mat-raised-button color="primary" class="full-width login-button" type="submit"
                                    [disabled]="loading || form.invalid || passwordMismatch">
                                    <span *ngIf="!loading">Reset Password</span>
                                    <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
                                </button>
                            </form>
                        </div>

                        <div *ngIf="success" class="success-state">
                            <div class="state-icon success-bg">
                                <mat-icon class="state-icon-inner success-color">check_circle</mat-icon>
                            </div>
                            <h2>Password Reset Complete</h2>
                            <p>Your password has been successfully reset. You can now sign in with your new password.</p>
                            <button mat-raised-button color="primary" routerLink="/auth/login" class="full-width login-button">
                                Sign In
                            </button>
                        </div>

                        <div *ngIf="invalidToken" class="error-state">
                            <div class="state-icon error-bg">
                                <mat-icon class="state-icon-inner error-color">error_outline</mat-icon>
                            </div>
                            <h2>Invalid or Expired Link</h2>
                            <p>This password reset link is invalid or has expired. Please request a new one.</p>
                            <button mat-raised-button color="primary" routerLink="/auth/forgot-password" class="full-width login-button">
                                Request New Link
                            </button>
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

        .success-state, .error-state {
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

        .error-bg {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
        }

        .state-icon-inner {
            font-size: 40px;
            width: 40px;
            height: 40px;
        }

        .success-color { color: #16a34a; }
        .error-color { color: #dc2626; }

        .success-state h2, .error-state h2 {
            margin: 0 0 12px;
            font-size: 22px;
            font-weight: 700;
            color: #1b1b1b;
        }

        .success-state p, .error-state p {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        .error-text {
            color: #dc2626;
            font-size: 13px;
            font-weight: 500;
            margin: -12px 0 16px;
            padding: 8px 12px;
            background: #fef2f2;
            border-radius: 8px;
            border: 1px solid #fecaca;
        }

        ::ng-deep mat-card-header {
            display: block !important;
            padding: 0 !important;
            margin-bottom: 32px !important;
        }

        mat-spinner {
            margin: 0 auto;
        }

        ::ng-deep button[matsuffix]:hover mat-icon {
            color: #ff5754;
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
export class ResetPasswordComponent implements OnInit {
    form: FormGroup;
    loading = false;
    success = false;
    invalidToken = false;
    hidePassword = true;
    hideConfirm = true;
    token = '';

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {
        this.form = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        });
    }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
        if (!this.token) {
            this.invalidToken = true;
        }
    }

    get passwordMismatch(): boolean {
        const np = this.form.get('newPassword')?.value;
        const cp = this.form.get('confirmPassword')?.value;
        return cp && np !== cp;
    }

    onSubmit(): void {
        if (this.form.invalid || this.passwordMismatch) return;
        this.loading = true;

        this.http.post('/api/auth/reset-password', {
            token: this.token,
            newPassword: this.form.value.newPassword
        }).subscribe({
            next: () => {
                this.loading = false;
                this.success = true;
            },
            error: (err) => {
                this.loading = false;
                const msg = err.error?.message || err.error?.error || 'Failed to reset password. The link may be invalid or expired.';
                if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
                    this.invalidToken = true;
                } else {
                    this.snackBar.open(msg, 'Close', { duration: 5000 });
                }
            }
        });
    }
}
