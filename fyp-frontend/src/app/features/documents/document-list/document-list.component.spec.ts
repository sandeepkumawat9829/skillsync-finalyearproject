import { of, throwError } from 'rxjs';
import { DocumentListComponent } from './document-list.component';
import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentStatus, DocumentType } from '../../../core/models/document.model';

describe('DocumentListComponent', () => {
    let component: DocumentListComponent;
    let documentServiceSpy: jasmine.SpyObj<DocumentService>;

    const mockDocuments: Document[] = [
        {
            documentId: 1,
            projectId: 1,
            fileName: 'proposal.pdf',
            fileUrl: 'http://example.com/proposal.pdf',
            fileSize: 1000,
            mimeType: 'application/pdf',
            documentType: DocumentType.PROPOSAL,
            status: DocumentStatus.APPROVED,
            uploadedBy: 1,
            uploadedByName: 'John',
            uploadedAt: new Date()
        }
    ];

    beforeEach(() => {
        documentServiceSpy = jasmine.createSpyObj('DocumentService', [
            'getDocumentsByProject', 'deleteDocument', 'formatFileSize', 'getFileIcon'
        ]);
        documentServiceSpy.getDocumentsByProject.and.returnValue(of(mockDocuments));
        documentServiceSpy.deleteDocument.and.returnValue(of(void 0));
        documentServiceSpy.formatFileSize.and.returnValue('1 KB');
        documentServiceSpy.getFileIcon.and.returnValue('picture_as_pdf');

        component = new DocumentListComponent(documentServiceSpy);
        component.projectId = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load documents on init', () => {
            component.ngOnInit();
            expect(documentServiceSpy.getDocumentsByProject).toHaveBeenCalledWith(1);
        });

        it('should populate documents array', () => {
            component.ngOnInit();
            expect(component.documents.length).toBe(1);
        });
    });

    describe('Filtering', () => {
        beforeEach(() => {
            component.documents = mockDocuments;
            component.allDocuments = mockDocuments;
        });

        it('should filter by type', () => {
            component.selectedType = DocumentType.PROPOSAL;
            component.applyFilters();
            expect(component.filteredDocuments.length).toBe(1);
        });
    });

    describe('Utility Methods', () => {
        it('should format file size', () => {
            const result = component.formatFileSize(1000);
            expect(documentServiceSpy.formatFileSize).toHaveBeenCalledWith(1000);
        });

        it('should get file icon', () => {
            const result = component.getFileIcon('proposal.pdf');
            expect(documentServiceSpy.getFileIcon).toHaveBeenCalledWith('proposal.pdf');
        });
    });

    describe('getStatusClass', () => {
        it('should return approved for APPROVED', () => {
            expect(component.getStatusClass(DocumentStatus.APPROVED)).toBe('approved');
        });

        it('should return pending for PENDING', () => {
            expect(component.getStatusClass(DocumentStatus.PENDING)).toBe('pending');
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadDocuments', () => {
            documentServiceSpy.getDocumentsByProject.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadDocuments()).not.toThrow();
        });
    });
});
