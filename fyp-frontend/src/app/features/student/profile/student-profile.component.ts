import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../core/services/user.service';
import { StudentProfile } from '../../../core/models/user.model';

@Component({
    selector: 'app-student-profile',
    templateUrl: './student-profile.component.html',
    styleUrls: ['./student-profile.component.scss']
})
export class StudentProfileComponent implements OnInit {
    profileForm!: FormGroup;
    profile: StudentProfile | null = null;
    loading = true;
    saving = false;

    skillInput = '';

    // Change Password
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    changingPassword = false;
    hideCurrentPw = true;
    hideNewPw = true;
    hideConfirmPw = true;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadProfile();
    }

    initForm(): void {
        this.profileForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            branch: [''],
            bio: ['', [Validators.maxLength(500)]],
            skills: [[]],
            phone: ['', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
            linkedinUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            githubUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]]
        });
    }

    loadProfile(): void {
        this.loading = true;
        this.userService.getMyProfile().subscribe({
            next: (data) => {
                this.profile = data;
                this.profileForm.patchValue({
                    fullName: data.fullName,
                    branch: data.branch || '',
                    bio: data.bio || '',
                    skills: data.skills || [],
                    phone: data.phone || '',
                    linkedinUrl: data.linkedinUrl || '',
                    githubUrl: data.githubUrl || ''
                });
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    addSkill(): void {
        if (!this.skillInput.trim()) return;

        const currentSkills = this.profileForm.get('skills')?.value || [];
        if (!currentSkills.includes(this.skillInput.trim())) {
            this.profileForm.patchValue({
                skills: [...currentSkills, this.skillInput.trim()]
            });
            this.skillInput = '';
        }
    }

    removeSkill(skill: string): void {
        const currentSkills = this.profileForm.get('skills')?.value || [];
        this.profileForm.patchValue({
            skills: currentSkills.filter((s: string) => s !== skill)
        });
    }

    onSubmit(): void {
        if (this.profileForm.invalid) {
            this.snackBar.open('Please fix form errors', 'Close', { duration: 3000 });
            return;
        }

        this.saving = true;
        this.userService.updateMyProfile(this.profileForm.value).subscribe({
            next: (updatedProfile) => {
                this.profile = updatedProfile;
                this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
                this.saving = false;
            },
            error: () => {
                this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
                this.saving = false;
            }
        });
    }

    resetForm(): void {
        if (this.profile) {
            this.profileForm.patchValue({
                fullName: this.profile.fullName,
                branch: this.profile.branch || '',
                bio: this.profile.bio || '',
                skills: this.profile.skills || [],
                phone: this.profile.phone || '',
                linkedinUrl: this.profile.linkedinUrl || '',
                githubUrl: this.profile.githubUrl || ''
            });
        }
    }

    onChangePassword(): void {
        if (!this.currentPassword || !this.newPassword || this.newPassword !== this.confirmPassword) {
            return;
        }

        this.changingPassword = true;
        this.http.post<any>('/api/auth/change-password', {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
        }).subscribe({
            next: (res) => {
                this.snackBar.open(res.message || 'Password changed successfully!', 'Close', { duration: 3000 });
                this.currentPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
                this.changingPassword = false;
            },
            error: (err) => {
                const msg = err.error?.message || err.error?.error || 'Failed to change password';
                this.snackBar.open(msg, 'Close', { duration: 5000 });
                this.changingPassword = false;
            }
        });
    }
}

