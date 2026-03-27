export interface Document {
    documentId: number;
    projectId: number;
    documentType: DocumentType;
    fileName: string;
    fileSize: number;
    fileUrl: string;
    uploadedBy: number;
    uploadedByName: string;
    uploadedAt: Date;
    version: number;
    description?: string;
    status: DocumentStatus;
    approvedBy?: number;
    approvedAt?: Date;
}

export enum DocumentType {
    ABSTRACT = 'ABSTRACT',
    FORM_1_ABSTRACT = 'FORM_1_ABSTRACT',
    FORM_2_ROLE_SPECIFICATION = 'FORM_2_ROLE_SPECIFICATION',
    FORM_3_WEEKLY_STATUS_MATRIX = 'FORM_3_WEEKLY_STATUS_MATRIX',
    PROPOSAL = 'PROPOSAL',
    SRS = 'SRS',
    DESIGN = 'DESIGN',
    REPORT = 'REPORT',
    PRESENTATION = 'PRESENTATION',
    PROJECT_REPORT = 'PROJECT_REPORT',
    PRESENTATION_PPT = 'PRESENTATION_PPT',
    RESEARCH_PAPER = 'RESEARCH_PAPER',
    OTHER = 'OTHER'
}

export enum DocumentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface UploadDocumentRequest {
    file: File;
    documentType: DocumentType;
    description?: string;
}
