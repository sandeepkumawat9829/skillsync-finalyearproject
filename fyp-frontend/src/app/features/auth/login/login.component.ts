import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    hidePassword = true;
    returnUrl: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        // Get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    get f() {
        return this.loginForm.controls;
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        this.authService.login(this.loginForm.value).subscribe({
            next: (response) => {
                this.loading = false;
                this.snackBar.open('Login successful!', 'Close', {
                    duration: 3000,
                    panelClass: ['success-snackbar']
                });

                // Navigate based on user role
                const userRole = response.role ? response.role.toLowerCase() : 'student';

                // ADMIN users skip the profile wizard check
                if (userRole !== 'admin' && !response.profileCompleted) {
                    this.router.navigate(['/auth/profile-wizard']);
                    return;
                }

                this.router.navigate([`/${userRole}/dashboard`]);
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
                this.snackBar.open(errorMessage, 'Close', {
                    duration: 5000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }
}
