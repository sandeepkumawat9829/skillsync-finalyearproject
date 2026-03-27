import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

interface ParsedProfileDTO {
  fullName?: string;
  phone?: string;
  branch?: string;
  semester?: number;
  cgpa?: number;
  skills?: string[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  confidence?: number;
  rawText?: string;
}

@Component({
  selector: 'app-profile-wizard',
  template: `
    <div class="wizard-container">
      <div class="wizard-card">
        <!-- Header -->
        <div class="wizard-header">
          <div class="logo-container">
            <div class="skillsync-icon">SS</div>
            <div class="skillsync-text">SkillSync</div>
          </div>
          <h1>Complete Your <span>Profile</span></h1>
          <p>{{ userRole === 'MENTOR' ? 'Fill in your details to start mentoring teams' : 'Fill in your details to get started with your FYP journey' }}</p>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
            <span class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</span>
            <span class="step-label">Resume</span>
          </div>
          <div class="step-line" [class.active]="currentStep > 1"></div>
          <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
            <span class="step-number">{{ currentStep > 2 ? '✓' : '2' }}</span>
            <span class="step-label">Basic Info</span>
          </div>
          <div class="step-line" [class.active]="currentStep > 2"></div>
          <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
            <span class="step-number">{{ currentStep > 3 ? '✓' : '3' }}</span>
            <span class="step-label">Skills</span>
          </div>
          <div class="step-line" [class.active]="currentStep > 3"></div>
          <div class="step" [class.active]="currentStep >= 4">
            <span class="step-number">4</span>
            <span class="step-label">Links</span>
          </div>
        </div>

        <!-- Step 1: Resume Upload (Students only) -->
        <div class="step-content" *ngIf="currentStep === 1 && userRole !== 'MENTOR'">
          <h2>Upload Your Resume <span class="optional-badge">Optional</span></h2>
          <p class="step-description">Upload a PDF resume to auto-fill your profile using AI ✨</p>
          
          <div class="upload-zone" 
               [class.dragging]="isDragging"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)">
            <div *ngIf="!selectedFile && !isUploading">
              <div class="upload-icon">📄</div>
              <p class="upload-text">Drag & drop your resume here</p>
              <p class="or-text">or</p>
              <label class="browse-btn">
                Browse Files
                <input type="file" accept=".pdf" (change)="onFileSelected($event)" hidden>
              </label>
              <p class="file-hint">PDF files only (max 10MB)</p>
            </div>
            
            <div *ngIf="selectedFile && !isUploading && !parsedData" class="file-selected">
              <div class="file-icon">📄</div>
              <p class="file-name">{{ selectedFile.name }}</p>
              <div class="file-actions">
                <button class="parse-btn" (click)="parseResume()">
                  🤖 Parse with AI
                </button>
                <button class="remove-btn" (click)="removeFile()">Remove</button>
              </div>
            </div>
            
            <div *ngIf="isUploading" class="uploading">
              <div class="spinner"></div>
              <p>Parsing resume with AI...</p>
            </div>
            
            <div *ngIf="parsedData" class="parsed-success">
              <div class="success-icon">✅</div>
              <p>Resume parsed successfully!</p>
              <p class="confidence">Confidence: {{ parsedData.confidence }}%</p>
              <div class="reupload-actions">
                <label class="reupload-btn">
                  📄 Upload Different Resume
                  <input type="file" accept=".pdf" (change)="onReuploadFile($event)" hidden>
                </label>
              </div>
            </div>
          </div>

          <div class="step-actions">
            <button class="skip-btn" (click)="skipStep()">Skip this step</button>
            <button class="next-btn" (click)="nextStep()" [disabled]="isUploading">
              {{ parsedData ? 'Continue with parsed data' : 'Continue manually' }}
            </button>
          </div>
        </div>

        <!-- Step 2: Basic Info (Student) -->
        <div class="step-content" *ngIf="currentStep === 2 && userRole !== 'MENTOR'">
          <h2>Basic Information</h2>
          <p class="step-description">Tell us about yourself</p>
          
          <form [formGroup]="basicInfoForm">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" formControlName="fullName" placeholder="Enter your full name">
              </div>
              <div class="form-group">
                <label>Enrollment Number *</label>
                <input type="text" formControlName="enrollmentNumber" placeholder="e.g., 2021CSE001">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Branch *</label>
                <select formControlName="branch">
                  <option value="">Select Branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div class="form-group">
                <label>Current Semester</label>
                <select formControlName="semester">
                  <option value="">Select Semester</option>
                  <option *ngFor="let sem of [1,2,3,4,5,6,7,8]" [value]="sem">{{ sem }}</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>CGPA</label>
                <input type="number" formControlName="cgpa" placeholder="e.g., 8.5" step="0.01" min="0" max="10">
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" formControlName="phone" placeholder="+91 XXXXX XXXXX">
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Bio / About Me</label>
              <textarea formControlName="bio" placeholder="Tell us about yourself, your interests, and goals..." rows="3"></textarea>
            </div>
          </form>

          <div class="step-actions">
            <button class="back-btn" (click)="prevStep()">← Back</button>
            <button class="next-btn" (click)="nextStep()" [disabled]="!basicInfoForm.valid">Continue →</button>
          </div>
        </div>

        <!-- Step 2: Basic Info (Mentor) -->
        <div class="step-content" *ngIf="currentStep === 2 && userRole === 'MENTOR'">
          <h2>Mentor Information</h2>
          <p class="step-description">Tell us about your professional background</p>
          
          <form [formGroup]="mentorInfoForm">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" formControlName="fullName" placeholder="Enter your full name">
              </div>
              <div class="form-group">
                <label>Employee ID *</label>
                <input type="text" formControlName="employeeId" placeholder="e.g., EMP001">
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Department *</label>
                <select formControlName="department">
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div class="form-group">
                <label>Designation</label>
                <select formControlName="designation">
                  <option value="">Select Designation</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="HOD">HOD</option>
                  <option value="Lab Instructor">Lab Instructor</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" formControlName="phone" placeholder="+91 XXXXX XXXXX">
              </div>
              <div class="form-group">
                <label>Office Location</label>
                <input type="text" formControlName="officeLocation" placeholder="e.g., Room 301, Block A">
              </div>
            </div>
            
            <div class="form-group full-width">
              <label>Bio / About Me</label>
              <textarea formControlName="bio" placeholder="Describe your research interests, expertise areas..." rows="3"></textarea>
            </div>

            <div class="form-group full-width">
              <label>Specializations (comma-separated)</label>
              <input type="text" formControlName="specializations" placeholder="e.g., Machine Learning, Web Development, Data Science">
            </div>
          </form>

          <div class="step-actions">
            <button class="back-btn" (click)="prevStep()">← Back</button>
            <button class="next-btn" (click)="nextStep()" [disabled]="!mentorInfoForm.valid">Continue →</button>
          </div>
        </div>

        <!-- Step 3: Skills -->
        <div class="step-content" *ngIf="currentStep === 3">
          <h2>Your Skills</h2>
          <p class="step-description">Select your technical skills</p>
          
          <div class="skills-grid">
            <div class="skill-chip" 
                 *ngFor="let skill of availableSkills"
                 [class.selected]="selectedSkills.includes(skill)"
                 (click)="toggleSkill(skill)">
              {{ skill }}
            </div>
          </div>
          
          <div class="custom-skill">
            <input type="text" 
                   [(ngModel)]="customSkill" 
                   placeholder="Add custom skill..."
                   (keyup.enter)="addCustomSkill()">
            <button (click)="addCustomSkill()" [disabled]="!customSkill">+ Add</button>
          </div>
          
          <div class="selected-skills" *ngIf="selectedSkills.length > 0">
            <p><strong>{{ selectedSkills.length }}</strong> skills selected: {{ selectedSkills.join(', ') }}</p>
          </div>

          <div class="step-actions">
            <button class="back-btn" (click)="prevStep()">← Back</button>
            <button class="next-btn" (click)="nextStep()">Continue →</button>
          </div>
        </div>

        <!-- Step 4: Links -->
        <div class="step-content" *ngIf="currentStep === 4">
          <h2>Online Profiles</h2>
          <p class="step-description">Add your professional links (optional)</p>
          
          <form [formGroup]="linksForm">
            <div class="form-group full-width link-input">
              <label>🐙 GitHub URL</label>
              <input type="url" formControlName="githubUrl" placeholder="https://github.com/username">
            </div>
            
            <div class="form-group full-width link-input">
              <label>💼 LinkedIn URL</label>
              <input type="url" formControlName="linkedinUrl" placeholder="https://linkedin.com/in/username">
            </div>
            
            <div class="form-group full-width link-input">
              <label>🌐 Portfolio URL</label>
              <input type="url" formControlName="portfolioUrl" placeholder="https://yourportfolio.com">
            </div>
          </form>

          <div class="step-actions">
            <button class="back-btn" (click)="prevStep()">← Back</button>
            <button class="submit-btn" (click)="submitProfile()" [disabled]="isSubmitting">
              {{ isSubmitting ? 'Saving...' : '🎉 Complete Profile' }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div class="error-message" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-container {
      min-height: 100vh;
      background: #e8e7ff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      position: relative;
    }

    .wizard-container::before {
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

    .wizard-card {
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 720px;
      width: 100%;
      box-shadow: 0 4px 24px rgba(27, 27, 27, 0.08);
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

    .wizard-header {
      text-align: center;
      margin-bottom: 36px;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }

    .skillsync-icon {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, #ff5754, #ff9a76);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
    }

    .skillsync-text {
      font-size: 32px;
      font-weight: 800;
      color: #1b1b1b;
    }

    .wizard-header h1 {
      font-size: 28px;
      font-weight: 800;
      margin: 16px 0 12px 0;
      color: #1b1b1b;
    }

    .wizard-header h1 span {
      background: linear-gradient(135deg, #ff5754, #ff9a76);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .wizard-header p {
      font-size: 15px;
      color: #6b7280;
      font-weight: 500;
      margin: 0;
    }

    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .step-number {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: #ff5754;
      color: white;
      box-shadow: 0 4px 12px rgba(255, 87, 84, 0.4);
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #ff5754;
      font-weight: 700;
    }

    .step.completed .step-label {
      color: #10b981;
    }

    .step-line {
      width: 60px;
      height: 3px;
      background: #e5e7eb;
      margin: 0 10px;
      border-radius: 2px;
      transition: background 0.3s;
    }

    .step-line.active {
      background: linear-gradient(135deg, #ff5754, #ff9a76);
    }

    .step-content h2 {
      color: #1b1b1b;
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }

    .optional-badge {
      background: #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 20px;
      margin-left: 8px;
      font-weight: 500;
    }

    .step-description {
      color: #6b7280;
      margin-bottom: 28px;
      font-size: 15px;
    }

    .upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 20px;
      padding: 50px;
      text-align: center;
      transition: all 0.3s;
      background: #fafafa;
      margin-bottom: 28px;
    }

    .upload-zone.dragging {
      border-color: #ff5754;
      background: rgba(255, 87, 84, 0.05);
    }

    .upload-icon {
      font-size: 56px;
      display: block;
      margin-bottom: 16px;
    }

    .upload-text {
      color: #1b1b1b;
      font-weight: 600;
      font-size: 16px;
      margin: 0 0 8px 0;
    }

    .browse-btn {
      background: #ff5754;
      color: white;
      padding: 14px 32px;
      border-radius: 28px;
      cursor: pointer;
      display: inline-block;
      margin: 12px 0;
      transition: all 0.3s;
      font-weight: 700;
      box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
    }

    .browse-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4);
    }

    .file-hint {
      color: #9ca3af;
      font-size: 13px;
      margin-top: 12px;
    }

    .or-text {
      color: #9ca3af;
      margin: 10px 0;
      font-size: 14px;
    }

    .file-selected {
      padding: 20px;
    }

    .file-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .file-name {
      color: #1b1b1b;
      font-weight: 600;
      font-size: 16px;
      margin: 0 0 16px 0;
    }

    .file-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .parse-btn {
      background: linear-gradient(135deg, #ff5754, #ff9a76);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 28px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 700;
      box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
      transition: all 0.3s;
    }

    .parse-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4);
    }

    .remove-btn {
      background: #fee2e2;
      color: #dc2626;
      border: none;
      padding: 14px 24px;
      border-radius: 28px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .remove-btn:hover {
      background: #fecaca;
    }

    .uploading {
      padding: 20px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #ffe0df;
      border-top: 4px solid #ff5754;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .success-icon {
      font-size: 56px;
    }

    .parsed-success p {
      color: #1b1b1b;
      font-weight: 600;
      margin: 12px 0 0 0;
    }

    .confidence {
      color: #10b981 !important;
      font-weight: 700 !important;
    }

    .reupload-actions {
      margin-top: 16px;
    }

    .reupload-btn {
      background: #f3f4f6;
      color: #374151;
      padding: 12px 24px;
      border-radius: 24px;
      cursor: pointer;
      display: inline-block;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
      border: 2px solid #e5e7eb;
    }

    .reupload-btn:hover {
      background: #e5e7eb;
      border-color: #ff5754;
      color: #ff5754;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
    }

    .back-btn, .skip-btn {
      background: transparent;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      padding: 14px 28px;
      border-radius: 28px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
    }

    .back-btn:hover, .skip-btn:hover {
      border-color: #ff5754;
      color: #ff5754;
    }

    .next-btn, .submit-btn {
      background: #ff5754;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 28px;
      cursor: pointer;
      font-weight: 700;
      box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
      transition: all 0.3s;
    }

    .next-btn:hover:not(:disabled), .submit-btn:hover:not(:disabled) {
      background: #ff6b68;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4);
    }

    .next-btn:disabled, .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
      margin-bottom: 20px;
    }

    .form-group label {
      color: #1b1b1b;
      margin-bottom: 8px;
      font-weight: 600;
      font-size: 14px;
    }

    .form-group input, .form-group select, .form-group textarea {
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 14px;
      font-size: 15px;
      transition: all 0.3s;
      background: white;
    }

    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      outline: none;
      border-color: #ff5754;
      box-shadow: 0 0 0 4px rgba(255, 87, 84, 0.1);
    }

    .link-input {
      margin-bottom: 16px;
    }

    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }

    .skill-chip {
      background: #f3f4f6;
      padding: 12px 20px;
      border-radius: 28px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
      color: #374151;
    }

    .skill-chip:hover {
      background: #e5e7eb;
    }

    .skill-chip.selected {
      background: linear-gradient(135deg, #ff5754, #ff9a76);
      color: white;
      box-shadow: 0 2px 8px rgba(255, 87, 84, 0.3);
    }

    .custom-skill {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .custom-skill input {
      flex: 1;
      padding: 14px 18px;
      border: 2px solid #e5e7eb;
      border-radius: 14px;
      font-size: 15px;
    }

    .custom-skill input:focus {
      outline: none;
      border-color: #ff5754;
    }

    .custom-skill button {
      background: #ff5754;
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 600;
      white-space: nowrap;
    }

    .custom-skill button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .selected-skills {
      color: #6b7280;
      font-size: 14px;
      background: #f9fafb;
      padding: 16px;
      border-radius: 12px;
    }

    .selected-skills strong {
      color: #ff5754;
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 16px;
      border-radius: 14px;
      margin-top: 24px;
      text-align: center;
      font-weight: 500;
      border: 1px solid #fecaca;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .wizard-card {
        padding: 28px 20px;
      }
      
      .progress-steps {
        transform: scale(0.75);
      }

      .logo-container {
        flex-direction: column;
        gap: 8px;
      }

      .skillsync-text {
        font-size: 24px;
      }

      .step-actions {
        flex-direction: column-reverse;
        gap: 12px;
      }

      .step-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProfileWizardComponent implements OnInit {
  currentStep = 1;
  isDragging = false;
  selectedFile: File | null = null;
  isUploading = false;
  isSubmitting = false;
  parsedData: ParsedProfileDTO | null = null;
  errorMessage = '';
  customSkill = '';
  userRole = '';

  basicInfoForm: FormGroup;
  mentorInfoForm: FormGroup;
  linksForm: FormGroup;

  selectedSkills: string[] = [];
  availableSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Spring Boot', 'Django',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Docker', 'AWS', 'Git', 'Machine Learning', 'Data Science'
  ];

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.basicInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      enrollmentNumber: ['', Validators.required],
      branch: ['', Validators.required],
      semester: [null],
      cgpa: [null],
      phone: [''],
      bio: ['']
    });

    this.mentorInfoForm = this.fb.group({
      fullName: ['', Validators.required],
      employeeId: ['', Validators.required],
      department: ['', Validators.required],
      designation: [''],
      phone: [''],
      bio: [''],
      officeLocation: [''],
      specializations: ['']
    });

    this.linksForm = this.fb.group({
      githubUrl: [''],
      linkedinUrl: [''],
      portfolioUrl: ['']
    });
  }

  ngOnInit(): void {
    this.checkProfileStatus();
  }

  checkProfileStatus(): void {
    this.http.get<{ profileCompleted: boolean, role: string }>(`${this.apiUrl}/profile/status`).subscribe({
      next: (res) => {
        this.userRole = res.role;
        if (res.profileCompleted) {
          this.router.navigate([this.userRole === 'MENTOR' ? '/mentor/dashboard' : '/student/dashboard']);
        }
        // For mentors, skip resume upload step - go straight to step 2
        if (this.userRole === 'MENTOR' && this.currentStep === 1) {
          this.currentStep = 2;
        }
      },
      error: () => { }
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
    // Clear the input value so the same file could be selected again if removed
    input.value = '';
  }

  handleFile(file: File): void {
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Please upload a PDF file';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 10MB';
      return;
    }
    this.selectedFile = file;
    this.errorMessage = '';
  }

  removeFile(): void {
    this.selectedFile = null;
    this.parsedData = null;
  }

  onReuploadFile(event: Event): void {
    // Clear existing parsed data and allow new upload
    this.parsedData = null;
    this.selectedFile = null;
    this.onFileSelected(event);
  }

  parseResume(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<ParsedProfileDTO>(`${this.apiUrl}/profile/parse-resume`, formData).subscribe({
      next: (data) => {
        this.parsedData = data;
        this.isUploading = false;
        this.applyParsedData(data);
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err.error?.rawText || 'Failed to parse resume';
      }
    });
  }

  applyParsedData(data: ParsedProfileDTO): void {
    if (data.fullName) this.basicInfoForm.patchValue({ fullName: data.fullName });
    if (data.phone) this.basicInfoForm.patchValue({ phone: data.phone });
    if (data.branch) this.basicInfoForm.patchValue({ branch: data.branch });
    if (data.semester) this.basicInfoForm.patchValue({ semester: data.semester });
    if (data.cgpa) this.basicInfoForm.patchValue({ cgpa: data.cgpa });
    if (data.bio) this.basicInfoForm.patchValue({ bio: data.bio });
    if (data.githubUrl) this.linksForm.patchValue({ githubUrl: data.githubUrl });
    if (data.linkedinUrl) this.linksForm.patchValue({ linkedinUrl: data.linkedinUrl });
    if (data.portfolioUrl) this.linksForm.patchValue({ portfolioUrl: data.portfolioUrl });
    if (data.skills) this.selectedSkills = [...data.skills];
  }

  toggleSkill(skill: string): void {
    const index = this.selectedSkills.indexOf(skill);
    if (index === -1) {
      this.selectedSkills.push(skill);
    } else {
      this.selectedSkills.splice(index, 1);
    }
  }

  addCustomSkill(): void {
    if (this.customSkill && !this.selectedSkills.includes(this.customSkill)) {
      this.selectedSkills.push(this.customSkill);
      if (!this.availableSkills.includes(this.customSkill)) {
        this.availableSkills.push(this.customSkill);
      }
      this.customSkill = '';
    }
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  skipStep(): void {
    this.nextStep();
  }

  submitProfile(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    let profileData: any;

    if (this.userRole === 'MENTOR') {
      const mentorValues = { ...this.mentorInfoForm.value };
      // Convert specializations string to array
      if (mentorValues.specializations && typeof mentorValues.specializations === 'string') {
        mentorValues.specializations = mentorValues.specializations.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      profileData = {
        ...mentorValues,
        ...this.linksForm.value
      };
    } else {
      profileData = {
        ...this.basicInfoForm.value,
        ...this.linksForm.value,
        skills: this.selectedSkills,
        resumeUrl: this.parsedData?.resumeUrl
      };
    }

    this.http.post<{ success: boolean, message: string }>(`${this.apiUrl}/profile/complete`, profileData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.router.navigate([this.userRole === 'MENTOR' ? '/mentor/dashboard' : '/student/dashboard']);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save profile';
      }
    });
  }
}
