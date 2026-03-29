import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="verify-container">
            <div class="verify-card">
                <div class="verify-header">
                    <div class="logo-container">
                        <img src="assets/images/skillsync-logo.svg" alt="SkillSync" class="skillsync-logo" />
                    </div>
                    <div class="email-icon">✉️</div>
                    <h1>Verify Your <span>Email</span></h1>
                    <p>We've sent a 6-digit code to <strong>{{ email }}</strong></p>
                </div>

                <div class="otp-input-container">
                    <input
                        *ngFor="let i of [0,1,2,3,4,5]"
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        class="otp-input"
                        [id]="'otp-' + i"
                        [value]="otpValues[i]"
                        (input)="handleInput($event, i)"
                        (keydown)="handleKeydown($event, i)"
                        (paste)="handlePaste($event)"
                        [class.filled]="otpValues[i]"
                        [class.error]="errorMessage"
                        autocomplete="one-time-code"
                    />
                </div>

                <div class="error-message" *ngIf="errorMessage">
                    {{ errorMessage }}
                </div>

                <div class="success-message" *ngIf="successMessage">
                    {{ successMessage }}
                </div>

                <button 
                    class="verify-btn"
                    (click)="verifyOTP()"
                    [disabled]="loading || !canSubmit"
                >
                    <span *ngIf="!loading">Verify Email</span>
                    <span *ngIf="loading" class="spinner"></span>
                </button>

                <div class="resend-section">
                    <p *ngIf="countdown > 0">
                        Resend code in <span class="countdown">{{ countdown }}s</span>
                    </p>
                    <button 
                        *ngIf="countdown === 0"
                        class="resend-btn"
                        (click)="resendOTP()"
                        [disabled]="resendLoading"
                    >
                        {{ resendLoading ? 'Sending...' : 'Resend Code' }}
                    </button>
                </div>

                <a class="back-link" routerLink="/auth/login">← Back to Login</a>
            </div>
        </div>
    `,
    styles: [`
        .verify-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: #e8e7ff;
            position: relative;
        }

        .verify-container::before {
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

        .verify-card {
            background: white;
            border-radius: 24px;
            padding: 48px 40px;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08);
            text-align: center;
            position: relative;
            z-index: 1;
            animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .verify-header {
            margin-bottom: 32px;
        }

        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }

        .skillsync-logo {
            height: 60px;
            width: auto;
            object-fit: contain;
        }

        .email-icon {
            font-size: 56px;
            margin-bottom: 16px;
        }

        h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 16px 0 12px 0;
            color: #1b1b1b;
        }

        h1 span {
            background: linear-gradient(135deg, #ff5754, #ff9a76);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        p {
            font-size: 15px;
            color: #6b7280;
            font-weight: 500;
            margin: 0;
        }

        p strong {
            color: #1b1b1b;
        }

        .otp-input-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 32px 0;
        }

        .otp-input {
            width: 52px;
            height: 64px;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            text-align: center;
            font-size: 26px;
            font-weight: 700;
            color: #1b1b1b;
            transition: all 0.3s ease;
            caret-color: transparent;
            background: white;
        }

        .otp-input:focus {
            border-color: #ff5754;
            box-shadow: 0 0 0 4px rgba(255, 87, 84, 0.15);
            outline: none;
        }

        .otp-input.filled {
            border-color: #ff5754;
            background: linear-gradient(135deg, rgba(255, 87, 84, 0.05), rgba(255, 154, 118, 0.05));
        }

        .otp-input.error {
            border-color: #e74c3c;
            animation: shake 0.5s ease;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }

        .error-message {
            color: #e74c3c;
            background: #fdeaea;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-weight: 500;
            font-size: 14px;
        }

        .success-message {
            color: #27ae60;
            background: #eafaf1;
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-weight: 500;
            font-size: 14px;
        }

        .verify-btn {
            width: 100%;
            height: 56px;
            background: #ff5754;
            border: none;
            border-radius: 28px;
            color: white;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
        }

        .verify-btn:hover:not(:disabled) {
            background: #ff6b68;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4);
        }

        .verify-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .spinner {
            width: 22px;
            height: 22px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .resend-section {
            margin-top: 28px;
            color: #6b7280;
            font-size: 14px;
        }

        .resend-section p {
            margin: 0;
        }

        .countdown {
            color: #ff5754;
            font-weight: 700;
        }

        .resend-btn {
            background: none;
            border: none;
            color: #ff5754;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.2s ease;
        }

        .resend-btn:hover:not(:disabled) {
            background: rgba(255, 87, 84, 0.1);
        }

        .resend-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .back-link {
            display: inline-block;
            margin-top: 24px;
            color: #6b7280;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s ease;
        }

        .back-link:hover {
            color: #ff5754;
        }

        @media (max-width: 480px) {
            .verify-card {
                padding: 32px 24px;
            }

            .otp-input {
                width: 44px;
                height: 56px;
                font-size: 22px;
            }

            .otp-input-container {
                gap: 8px;
            }

            .logo-container {
                flex-direction: column;
                gap: 8px;
            }

            .skillsync-text {
                font-size: 24px;
            }
        }
    `]
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    email: string = '';
    otpValues: string[] = ['', '', '', '', '', ''];
    loading = false;
    resendLoading = false;
    countdown = 60;
    countdownInterval: any;
    errorMessage = '';
    successMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    get canSubmit(): boolean {
        return this.otpValues.every(v => v !== '');
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || sessionStorage.getItem('verifyEmail') || '';
        });

        if (!this.email) {
            this.router.navigate(['/auth/register']);
            return;
        }

        this.startCountdown();
    }

    ngOnDestroy(): void {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
    }

    startCountdown(): void {
        this.countdown = 60;
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        this.countdownInterval = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
            } else {
                clearInterval(this.countdownInterval);
            }
        }, 1000);
    }

    handleInput(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        // Only accept digits
        if (!/^\d$/.test(value)) {
            input.value = this.otpValues[index];
            return;
        }

        // Update the value
        this.otpValues[index] = value;
        this.errorMessage = '';

        // Move to next input
        if (index < 5) {
            const nextInput = document.getElementById('otp-' + (index + 1)) as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    }

    handleKeydown(event: KeyboardEvent, index: number): void {
        const input = event.target as HTMLInputElement;

        if (event.key === 'Backspace') {
            event.preventDefault();

            if (this.otpValues[index]) {
                // Clear current
                this.otpValues[index] = '';
                input.value = '';
            } else if (index > 0) {
                // Move to previous and clear it
                const prevInput = document.getElementById('otp-' + (index - 1)) as HTMLInputElement;
                if (prevInput) {
                    this.otpValues[index - 1] = '';
                    prevInput.value = '';
                    prevInput.focus();
                }
            }
        } else if (event.key === 'ArrowLeft' && index > 0) {
            event.preventDefault();
            const prevInput = document.getElementById('otp-' + (index - 1)) as HTMLInputElement;
            prevInput?.focus();
        } else if (event.key === 'ArrowRight' && index < 5) {
            event.preventDefault();
            const nextInput = document.getElementById('otp-' + (index + 1)) as HTMLInputElement;
            nextInput?.focus();
        } else if (/^\d$/.test(event.key)) {
            // If a digit is pressed and current has value, replace it
            event.preventDefault();
            this.otpValues[index] = event.key;
            input.value = event.key;
            this.errorMessage = '';

            // Move to next
            if (index < 5) {
                const nextInput = document.getElementById('otp-' + (index + 1)) as HTMLInputElement;
                if (nextInput) {
                    nextInput.focus();
                    nextInput.select();
                }
            }
        } else if (!/^(Tab|Enter|Escape)$/.test(event.key)) {
            // Block non-digit, non-control keys
            event.preventDefault();
        }
    }

    handlePaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedData = event.clipboardData?.getData('text') || '';
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');

        digits.forEach((digit, i) => {
            this.otpValues[i] = digit;
            const input = document.getElementById('otp-' + i) as HTMLInputElement;
            if (input) input.value = digit;
        });

        // Focus appropriate input
        const focusIndex = Math.min(digits.length, 5);
        const focusInput = document.getElementById('otp-' + focusIndex) as HTMLInputElement;
        focusInput?.focus();
    }

    getOtpCode(): string {
        return this.otpValues.join('');
    }

    verifyOTP(): void {
        if (!this.canSubmit) return;

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.verifyEmail(this.email, this.getOtpCode()).subscribe({
            next: (response) => {
                this.successMessage = 'Email verified successfully!';
                sessionStorage.removeItem('verifyEmail');

                setTimeout(() => {
                    this.router.navigate(['/auth/complete-profile']);
                }, 1500);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = error.error?.message || 'Invalid OTP. Please try again.';
                this.otpValues = ['', '', '', '', '', ''];
                // Clear input values
                for (let i = 0; i < 6; i++) {
                    const input = document.getElementById('otp-' + i) as HTMLInputElement;
                    if (input) input.value = '';
                }
                const firstInput = document.getElementById('otp-0') as HTMLInputElement;
                firstInput?.focus();
            }
        });
    }

    resendOTP(): void {
        this.resendLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.resendOTP(this.email).subscribe({
            next: (response) => {
                this.resendLoading = false;
                this.successMessage = 'A new code has been sent to your email.';
                this.startCountdown();
            },
            error: (error) => {
                this.resendLoading = false;
                this.errorMessage = error.error?.message || 'Failed to resend code. Please try again.';
            }
        });
    }
}
