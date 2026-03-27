import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { MentorService } from '../../../core/services/mentor.service';
import { User } from '../../../core/models/user.model';

@Component({
    selector: 'app-mentor-own-profile',
    templateUrl: './mentor-own-profile.component.html',
    styleUrls: ['./mentor-own-profile.component.scss']
})
export class MentorOwnProfileComponent implements OnInit {
    currentUser: User | null = null;
    mentorProfile: any = null;
    loading = true;
    editing = false;
    saving = false;
    editForm!: FormGroup;

    constructor(
        private authService: AuthService,
        private mentorService: MentorService,
        private snackBar: MatSnackBar,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.currentUserValue;
        this.initForm();
        this.loadProfile();
    }

    initForm(): void {
        this.editForm = this.fb.group({
            designation: ['', [Validators.required]],
            department: ['', [Validators.required]],
            phone: ['', [Validators.pattern(/^\+?[\d\s\-()]+$/)]],
            officeLocation: [''],
            bio: ['', [Validators.maxLength(500)]],
            maxProjectsAllowed: [5, [Validators.required, Validators.min(1), Validators.max(20)]]
        });
    }

    loadProfile(): void {
        if (!this.currentUser) {
            this.loading = false;
            return;
        }

        this.mentorService.getMentorById(this.currentUser.userId).subscribe({
            next: (data) => {
                this.mentorProfile = data;
                this.patchForm();
                this.loading = false;
            },
            error: () => {
                this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    patchForm(): void {
        if (!this.mentorProfile) return;
        this.editForm.patchValue({
            designation: this.mentorProfile.designation || '',
            department: this.mentorProfile.department || '',
            phone: this.mentorProfile.phone || '',
            officeLocation: this.mentorProfile.officeLocation || '',
            bio: this.mentorProfile.bio || '',
            maxProjectsAllowed: this.mentorProfile.maxStudents || 5
        });
    }

    toggleEdit(): void {
        this.editing = !this.editing;
        if (this.editing) {
            this.patchForm();
        }
    }

    cancelEdit(): void {
        this.editing = false;
        this.patchForm();
    }

    saveProfile(): void {
        if (this.editForm.invalid) {
            this.snackBar.open('Please fix form errors', 'Close', { duration: 3000 });
            return;
        }

        this.saving = true;
        this.mentorService.updateMentorProfile(this.editForm.value).subscribe({
            next: (updated) => {
                this.mentorProfile = updated;
                this.editing = false;
                this.saving = false;
                this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
            },
            error: () => {
                this.snackBar.open('Error updating profile', 'Close', { duration: 3000 });
                this.saving = false;
            }
        });
    }
}
