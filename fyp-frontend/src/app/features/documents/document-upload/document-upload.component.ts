import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentType, UploadDocumentRequest } from '../../../core/models/document.model';

@Component({
    selector: 'app-document-upload',
    templateUrl: './document-upload.component.html',
    styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent {
    @Input() projectId!: number;
    @Output() uploadComplete = new EventEmitter<void>();

    selectedFile: File | null = null;
    documentType: DocumentType = DocumentType.PROPOSAL;
    description = '';
    uploading = false;
    uploadProgress = 0;
    dragOver = false;

    documentTypes = [
        { value: DocumentType.ABSTRACT, label: 'Abstract' },
        { value: DocumentType.FORM_1_ABSTRACT, label: 'Form-1 (Project Abstract)' },
        { value: DocumentType.FORM_2_ROLE_SPECIFICATION, label: 'Form-2 (Role Specification)' },
        { value: DocumentType.FORM_3_WEEKLY_STATUS_MATRIX, label: 'Form-3 (Weekly Status Matrix)' },
        { value: DocumentType.PROPOSAL, label: 'Project Proposal' },
        { value: DocumentType.SRS, label: 'SRS Document' },
        { value: DocumentType.DESIGN, label: 'Design Document' },
        { value: DocumentType.REPORT, label: 'Progress Report' },
        { value: DocumentType.PRESENTATION, label: 'Presentation' },
        { value: DocumentType.PROJECT_REPORT, label: 'Final Project Report' },
        { value: DocumentType.PRESENTATION_PPT, label: 'Presentation (PPT/PPTX)' },
        { value: DocumentType.RESEARCH_PAPER, label: 'Research Paper' },
        { value: DocumentType.OTHER, label: 'Other' }
    ];

    constructor(
        private documentService: DocumentService,
        private snackBar: MatSnackBar
    ) { }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver = false;

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
    }

    private handleFile(file: File): void {
        this.selectedFile = file;
    }

    upload(): void {
        if (!this.selectedFile) {
            this.snackBar.open('Please select a file', 'Close', { duration: 3000 });
            return;
        }

        const request: UploadDocumentRequest = {
            file: this.selectedFile,
            documentType: this.documentType,
            description: this.description
        };

        console.log('DocumentUploadComponent: Starting upload...', request);

        this.uploading = true;
        this.uploadProgress = 0;

        // Simulate upload progress
        const progressInterval = setInterval(() => {
            this.uploadProgress += 10;
            if (this.uploadProgress >= 90) {
                clearInterval(progressInterval);
            }
        }, 150);

        this.documentService.uploadDocument(this.projectId, request).subscribe({
            next: (res) => {
                console.log('DocumentUploadComponent: Upload success!', res);
                clearInterval(progressInterval);
                this.uploadProgress = 100;
                this.snackBar.open('Document uploaded successfully!', 'Close', { duration: 3000 });
                this.resetForm();
                this.uploadComplete.emit();
            },
            error: (error) => {
                console.error('DocumentUploadComponent: Upload error', error);
                clearInterval(progressInterval);
                this.snackBar.open(error.message || 'Error uploading document', 'Close', { duration: 3000 });
                this.uploading = false;
                this.uploadProgress = 0;
            }
        });
    }

    removeFile(): void {
        this.selectedFile = null;
    }

    private resetForm(): void {
        this.selectedFile = null;
        this.description = '';
        this.uploading = false;
        this.uploadProgress = 0;
    }

    getFileIcon(fileName: string): string {
        return this.documentService.getFileIcon(fileName);
    }

    formatFileSize(bytes: number): string {
        return this.documentService.formatFileSize(bytes);
    }
}
