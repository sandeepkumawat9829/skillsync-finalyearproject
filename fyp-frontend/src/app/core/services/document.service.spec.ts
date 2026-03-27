import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { Document, DocumentType, DocumentStatus, UploadDocumentRequest } from '../models/document.model';

describe('DocumentService', () => {
    let service: DocumentService;
    let httpMock: HttpTestingController;

    const mockDocument: Document = {
        documentId: 1,
        projectId: 1,
        fileName: 'Project Proposal.pdf',
        documentType: DocumentType.PROPOSAL,
        fileUrl: 'https://cloudinary.com/doc.pdf',
        fileSize: 1024000,
        uploadedBy: 1,
        uploadedByName: 'John Doe',
        status: DocumentStatus.PENDING,
        description: 'Initial proposal document',
        uploadedAt: new Date(),
        version: 1
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DocumentService]
        });
        service = TestBed.inject(DocumentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getDocumentsByProject', () => {
        it('should fetch documents by project ID', () => {
            service.getDocumentsByProject(1).subscribe(documents => {
                expect(documents.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/project/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockDocument]);
        });
    });

    describe('getDocumentById', () => {
        it('should fetch document by ID', () => {
            service.getDocumentById(1).subscribe(document => {
                expect(document).toEqual(mockDocument);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockDocument);
        });
    });

    describe('uploadDocument', () => {
        it('should send POST request with FormData to upload document', () => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const request: UploadDocumentRequest = {
                file: file,
                documentType: DocumentType.PROPOSAL,
                description: 'Test description'
            };

            service.uploadDocument(1, request).subscribe(result => {
                expect(result).toEqual(mockDocument);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/project/1/upload');
            expect(req.request.method).toBe('POST');
            expect(req.request.body instanceof FormData).toBeTrue();
            req.flush(mockDocument);
        });
    });

    describe('approveDocument', () => {
        it('should send POST request to approve document', () => {
            service.approveDocument(1).subscribe(result => {
                expect(result).toEqual(mockDocument);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/1/approve');
            expect(req.request.method).toBe('POST');
            req.flush(mockDocument);
        });
    });

    describe('rejectDocument', () => {
        it('should send POST request to reject document with reason', () => {
            service.rejectDocument(1, 'Missing sections').subscribe(result => {
                expect(result).toEqual(mockDocument);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/1/reject');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ reason: 'Missing sections' });
            req.flush(mockDocument);
        });
    });

    describe('deleteDocument', () => {
        it('should send DELETE request', () => {
            service.deleteDocument(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/documents/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('formatFileSize', () => {
        it('should format 0 bytes correctly', () => {
            expect(service.formatFileSize(0)).toBe('0 Bytes');
        });

        it('should format bytes correctly', () => {
            expect(service.formatFileSize(500)).toBe('500 Bytes');
        });

        it('should format KB correctly', () => {
            expect(service.formatFileSize(1024)).toBe('1 KB');
        });

        it('should format MB correctly', () => {
            expect(service.formatFileSize(1048576)).toBe('1 MB');
        });

        it('should format with decimals', () => {
            expect(service.formatFileSize(1536)).toBe('1.5 KB');
        });
    });

    describe('getFileIcon', () => {
        it('should return pdf icon for pdf files', () => {
            expect(service.getFileIcon('document.pdf')).toBe('picture_as_pdf');
        });

        it('should return description icon for doc files', () => {
            expect(service.getFileIcon('document.doc')).toBe('description');
            expect(service.getFileIcon('document.docx')).toBe('description');
        });

        it('should return slideshow icon for ppt files', () => {
            expect(service.getFileIcon('presentation.ppt')).toBe('slideshow');
            expect(service.getFileIcon('presentation.pptx')).toBe('slideshow');
        });

        it('should return default icon for unknown files', () => {
            expect(service.getFileIcon('file.xyz')).toBe('insert_drive_file');
        });
    });

    describe('getDocumentTypeLabel', () => {
        it('should return correct labels for document types', () => {
            expect(service.getDocumentTypeLabel(DocumentType.PROPOSAL)).toBe('Project Proposal');
            expect(service.getDocumentTypeLabel(DocumentType.SRS)).toBe('SRS Document');
            expect(service.getDocumentTypeLabel(DocumentType.DESIGN)).toBe('Design Document');
            expect(service.getDocumentTypeLabel(DocumentType.REPORT)).toBe('Progress Report');
            expect(service.getDocumentTypeLabel(DocumentType.PRESENTATION)).toBe('Presentation');
            expect(service.getDocumentTypeLabel(DocumentType.OTHER)).toBe('Other Document');
        });
    });
});
