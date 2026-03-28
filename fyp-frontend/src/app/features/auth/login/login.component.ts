import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
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
        private toastService: ToastService
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
                this.toastService.success('Login successful!');

                // Navigate based on user role
                const userRole = response.role ? response.role.toLowerCase() : 'student';

                // ADMIN users skip the profile wizard check
                if (userRole !== 'admin' && !response.profileCompleted) {
                    this.router.navigate(['/auth/complete-profile']);
                    return;
                }

                this.router.navigate([`/${userRole}/dashboard`]);
            },
            error: (error) => {
                this.loading = false;
                const errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
                this.toastService.error(errorMessage);
            }
        });
    }
}
