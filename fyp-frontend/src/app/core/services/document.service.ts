import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Document, DocumentType, UploadDocumentRequest } from '../models/document.model';

export interface FormGenerateRequest {
    labCoordinatorName?: string;
    projectTrack?: string;
    briefIntroduction?: string;
    toolsTechnologies?: string;
    proposedModules?: string;
    roleSpecificationNotes?: string;
    mentorName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = 'http://localhost:8080/api/documents';

    constructor(private http: HttpClient) { }

    // Get all documents for a project
    getDocumentsByProject(projectId: number): Observable<Document[]> {
        return this.http.get<any[]>(`${this.apiUrl}/project/${projectId}`).pipe(
            map(documents => documents.map(document => this.mapDocument(document)))
        );
    }

    // Get document by ID
    getDocumentById(documentId: number): Observable<Document> {
        return this.http.get<any>(`${this.apiUrl}/${documentId}`).pipe(
            map(document => this.mapDocument(document))
        );
    }

    // Upload a new document
    uploadDocument(projectId: number, request: UploadDocumentRequest): Observable<Document> {
        console.log('DocumentService: Uploading document to backend...', { projectId, file: request.file.name, type: request.documentType });
        const formData = new FormData();
        formData.append('file', request.file);
        formData.append('documentType', request.documentType);
        if (request.description) {
            formData.append('description', request.description);
        }

        return this.http.post<any>(`${this.apiUrl}/project/${projectId}/upload`, formData).pipe(
            map(document => this.mapDocument(document))
        );
    }

    // Generate and upload Form-1/2/3 as a PDF document
    generateForm(projectId: number, formType: 'form1' | 'form2' | 'form3', request: FormGenerateRequest = {}): Observable<Document> {
        return this.http.post<any>(`${this.apiUrl}/project/${projectId}/generate/${formType}`, request).pipe(
            map(document => this.mapDocument(document))
        );
    }

    // Approve document (mentor only)
    approveDocument(documentId: number): Observable<Document> {
        return this.http.post<any>(`${this.apiUrl}/${documentId}/approve`, {}).pipe(
            map(document => this.mapDocument(document))
        );
    }

    // Reject document (mentor only)
    rejectDocument(documentId: number, reason: string): Observable<Document> {
        return this.http.post<any>(`${this.apiUrl}/${documentId}/reject`, { reason }).pipe(
            map(document => this.mapDocument(document))
        );
    }

    // Delete document
    deleteDocument(documentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${documentId}`);
    }

    // Helper: Format file size
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Helper: Get file icon based on extension
    getFileIcon(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'picture_as_pdf';
            case 'doc':
            case 'docx': return 'description';
            case 'ppt':
            case 'pptx': return 'slideshow';
            default: return 'insert_drive_file';
        }
    }

    // Helper: Get document type label
    getDocumentTypeLabel(type: DocumentType): string {
        const labels: { [key in DocumentType]: string } = {
            [DocumentType.ABSTRACT]: 'Abstract',
            [DocumentType.FORM_1_ABSTRACT]: 'Form-1 (Project Abstract)',
            [DocumentType.FORM_2_ROLE_SPECIFICATION]: 'Form-2 (Role Specification)',
            [DocumentType.FORM_3_WEEKLY_STATUS_MATRIX]: 'Form-3 (Weekly Status Matrix)',
            [DocumentType.PROPOSAL]: 'Project Proposal',
            [DocumentType.SRS]: 'SRS Document',
            [DocumentType.DESIGN]: 'Design Document',
            [DocumentType.REPORT]: 'Progress Report',
            [DocumentType.PRESENTATION]: 'Presentation',
            [DocumentType.PROJECT_REPORT]: 'Final Project Report',
            [DocumentType.PRESENTATION_PPT]: 'Presentation (PPT/PPTX)',
            [DocumentType.RESEARCH_PAPER]: 'Research Paper',
            [DocumentType.OTHER]: 'Other Document'
        };
        return labels[type];
    }

    private mapDocument(document: any): Document {
        return {
            documentId: document.id,
            projectId: document.projectId,
            documentType: document.documentType,
            fileName: document.originalFileName || document.fileName,
            fileSize: document.fileSize,
            fileUrl: document.fileUrl,
            uploadedBy: document.uploadedById,
            uploadedByName: document.uploadedByName,
            uploadedAt: document.uploadedAt,
            version: document.version,
            description: document.description,
            status: document.status,
            approvedBy: document.approvedById,
            approvedAt: document.approvedAt
        };
    }
}
