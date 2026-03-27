import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  accountForm!: FormGroup;
  profileForm!: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  selectedRole: 'STUDENT' | 'MENTOR' = 'STUDENT';

  branches = [
    'Computer Science Engineering',
    'Information Technology',
    'Electronics and Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  semesters = [5, 6, 7, 8];

  designations = [
    'Assistant Professor',
    'Associate Professor',
    'Professor',
    'Senior Professor'
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.accountForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['STUDENT', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      enrollmentNumber: [''],
      employeeId: [''],
      branch: [''],
      department: [''],
      currentSemester: [''],
      designation: [''],
      cgpa: ['', [Validators.min(0), Validators.max(10)]],
      phone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      bio: [''],
      skills: [''],
      specialization: [''],
      githubUrl: [''],
      linkedinUrl: [''],
      portfolioUrl: [''],
      officeLocation: [''],
      maxProjectsAllowed: [5]
    });

    this.accountForm.get('role')?.valueChanges.subscribe(role => {
      this.selectedRole = role;
      this.updateProfileValidators();
    });

    this.updateProfileValidators();
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  updateProfileValidators(): void {
    if (this.selectedRole === 'STUDENT') {
      this.profileForm.get('enrollmentNumber')?.setValidators([Validators.required]);
      this.profileForm.get('branch')?.setValidators([Validators.required]);
      this.profileForm.get('currentSemester')?.setValidators([Validators.required]);
      this.profileForm.get('cgpa')?.setValidators([Validators.required, Validators.min(0), Validators.max(10)]);

      this.profileForm.get('employeeId')?.clearValidators();
      this.profileForm.get('department')?.clearValidators();
      this.profileForm.get('designation')?.clearValidators();
    } else {
      this.profileForm.get('employeeId')?.setValidators([Validators.required]);
      this.profileForm.get('department')?.setValidators([Validators.required]);
      this.profileForm.get('designation')?.setValidators([Validators.required]);

      this.profileForm.get('enrollmentNumber')?.clearValidators();
      this.profileForm.get('branch')?.clearValidators();
      this.profileForm.get('currentSemester')?.clearValidators();
      this.profileForm.get('cgpa')?.clearValidators();
    }

    this.profileForm.updateValueAndValidity();
  }

  onSubmit(): void {
    // Only require accountForm - profile details will be collected in profile wizard
    if (this.accountForm.invalid) {
      return;
    }

    this.loading = true;

    // Simplified registration - only email, password, role
    const registerData = {
      email: this.accountForm.value.email,
      password: this.accountForm.value.password,
      role: this.selectedRole
    };

    console.log('Registering with data:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open('Registration successful! Please verify your email.', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        // Redirect to email verification page
        this.router.navigate(['/auth/verify-email'], {
          queryParams: { email: registerData.email }
        });
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.loading = false;
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
