import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentUploadComponent } from './document-upload.component';
import { DocumentService } from '../../../core/services/document.service';

describe('DocumentUploadComponent', () => {
    let component: DocumentUploadComponent;
    let documentServiceSpy: jasmine.SpyObj<DocumentService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        documentServiceSpy = jasmine.createSpyObj('DocumentService', [
            'uploadDocument', 'validateFile'
        ]);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        documentServiceSpy.uploadDocument.and.returnValue(of({
            documentId: 1,
            projectId: 1,
            fileName: 'test.pdf',
            fileUrl: 'url',
            fileSize: 1000,
            mimeType: 'application/pdf',
            documentType: 'PROPOSAL',
            status: 'PENDING',
            uploadedBy: 1,
            uploadedAt: new Date()
        }));
        documentServiceSpy.validateFile.and.returnValue(true);

        component = new DocumentUploadComponent(documentServiceSpy, snackBarSpy);
        component.projectId = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should have document types', () => {
            expect(component.documentTypes.length).toBeGreaterThan(0);
        });
    });

    describe('onFileSelected', () => {
        it('should validate file before setting', () => {
            const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const event = { target: { files: [mockFile] } };
            component.onFileSelected(event as any);
            expect(documentServiceSpy.validateFile).toHaveBeenCalled();
        });
    });
});
