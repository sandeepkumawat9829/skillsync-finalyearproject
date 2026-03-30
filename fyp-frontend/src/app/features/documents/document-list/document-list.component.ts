import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DocumentService } from '../../../core/services/document.service';
import { Document, DocumentType, DocumentStatus } from '../../../core/models/document.model';
import { AuthService } from '../../../core/services/auth.service';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { Chart } from 'chart.js/auto';

@Component({
    selector: 'app-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
    @Input() projectId!: number;

    documents: Document[] = [];
    loading = true;
    isMentor = false;
    currentUserId = 0;

    // Reject Dialog state
    rejectReason = '';
    rejectingDoc: Document | null = null;
    isRejecting = false;

    // Group documents by type
    proposalDocs: Document[] = [];
    srsDocs: Document[] = [];
    designDocs: Document[] = [];
    reportDocs: Document[] = [];
    presentationDocs: Document[] = [];
    otherDocs: Document[] = [];

    // Generation UI State
    showGenerateUI = false;
    selectedFormType: 'form1' | 'form2' | 'form3' = 'form1';
    generationMode: 'auto' | 'manual' = 'auto';
    isGenerating = false;
    
    generateFormData = {
        labCoordinatorName: '',
        projectTrack: '',
        briefIntroduction: '',
        tools: [
            { name: '', version: '', type: 'SOFTWARE', purpose: '' }
        ],
        modules: [
            { name: '', functionality: '' }
        ],
        memberRoles: [
            { handlingModule: '', activityName: '', softDeadline: '', hardDeadline: '', story: '' },
            { handlingModule: '', activityName: '', softDeadline: '', hardDeadline: '', story: '' },
            { handlingModule: '', activityName: '', softDeadline: '', hardDeadline: '', story: '' },
            { handlingModule: '', activityName: '', softDeadline: '', hardDeadline: '', story: '' }
        ],
        mentorName: ''
    };

    // New groups
    abstractDocs: Document[] = [];
    form1Docs: Document[] = [];
    form2Docs: Document[] = [];
    form3Docs: Document[] = [];
    finalReportDocs: Document[] = [];
    pptDocs: Document[] = [];
    researchPaperDocs: Document[] = [];

    constructor(
        private documentService: DocumentService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        const currentUser = this.authService.currentUserValue;
        this.isMentor = currentUser?.role === 'MENTOR';
        this.currentUserId = currentUser?.userId || 0;

        if (!this.projectId) {
            this.projectId = +(this.route.parent?.snapshot.paramMap.get('id')
                || this.route.snapshot.paramMap.get('projectId')
                || this.route.snapshot.queryParamMap.get('projectId')
                || 0);
        }

        if (!this.projectId) {
            this.loading = false;
            this.snackBar.open('Project not found for documents', 'Close', { duration: 3000 });
            return;
        }

        this.loadDocuments();
    }

    loadDocuments(): void {
        this.loading = true;
        this.documentService.getDocumentsByProject(this.projectId).subscribe({
            next: (data: any) => {
                this.documents = data;
                this.groupDocuments();
                this.loading = false;
            },
            error: (error: any) => {
                const message = error?.error?.message || 'Error loading documents';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.loading = false;
            }
        });
    }

    private groupDocuments(): void {
        this.abstractDocs = this.documents.filter(d => d.documentType === DocumentType.ABSTRACT);
        this.form1Docs = this.documents.filter(d => d.documentType === DocumentType.FORM_1_ABSTRACT);
        this.form2Docs = this.documents.filter(d => d.documentType === DocumentType.FORM_2_ROLE_SPECIFICATION);
        this.form3Docs = this.documents.filter(d => d.documentType === DocumentType.FORM_3_WEEKLY_STATUS_MATRIX);
        this.proposalDocs = this.documents.filter(d => d.documentType === DocumentType.PROPOSAL);
        this.srsDocs = this.documents.filter(d => d.documentType === DocumentType.SRS);
        this.designDocs = this.documents.filter(d => d.documentType === DocumentType.DESIGN);
        this.reportDocs = this.documents.filter(d => d.documentType === DocumentType.REPORT);
        this.presentationDocs = this.documents.filter(d => d.documentType === DocumentType.PRESENTATION);
        this.finalReportDocs = this.documents.filter(d => d.documentType === DocumentType.PROJECT_REPORT);
        this.pptDocs = this.documents.filter(d => d.documentType === DocumentType.PRESENTATION_PPT);
        this.researchPaperDocs = this.documents.filter(d => d.documentType === DocumentType.RESEARCH_PAPER);
        this.otherDocs = this.documents.filter(d => d.documentType === DocumentType.OTHER);
    }

    generateForm(formType: 'form1' | 'form2' | 'form3', manual: boolean): void {
        const req: any = {};
        if (manual) {
            req.labCoordinatorName = prompt('Lab Coordinator Name (optional)') || '';
            req.projectTrack = prompt('Project Track (optional, e.g. R&D, STARTUP)') || '';
            req.briefIntroduction = prompt('Brief Introduction (optional)') || '';
            req.toolsTechnologies = prompt('Tools/Technologies (optional)') || '';
            req.proposedModules = prompt('Proposed Modules (optional)') || '';
            req.mentorName = prompt('Mentor Name (Form-2 only, optional)') || '';
        }

        this.documentService.generateForm(this.projectId, formType, req).subscribe({
            next: () => {
                this.snackBar.open(`Generated ${formType.toUpperCase()} successfully`, 'Close', { duration: 3000 });
                this.loadDocuments();
            },
            error: (error) => {
                const message = error?.error?.message || 'Error generating form';
                this.snackBar.open(message, 'Close', { duration: 3000 });
            }
        });
    }

    toggleGenerateUI(): void {
        this.showGenerateUI = !this.showGenerateUI;
    }

    isExporting = false;
    exportAllDocuments(): void {
        this.isExporting = true;
        this.snackBar.open('Generating Mega Report...', 'Close', { duration: 3000 });
        
        // Render chart hidden based on document statuses
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        
        const approvedCount = this.documents.filter(d => d.status === 'APPROVED').length;
        const pendingCount = this.documents.filter(d => d.status !== 'APPROVED').length;

        const myChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Approved Docs', 'Pending Docs'],
                datasets: [{
                    data: [approvedCount, pendingCount],
                    backgroundColor: ['#4caf50', '#ff9800']
                }]
            },
            options: { animation: false } 
        });

        let chartBase64 = '';
        if (approvedCount > 0 || pendingCount > 0) {
            chartBase64 = myChart.toBase64Image();
        }
        myChart.destroy();
        
        this.documentService.exportMegaReport(this.projectId, { progressChartBase64: chartBase64 }).subscribe({
            next: (blob: any) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Mega_Report_Project_${this.projectId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                this.snackBar.open('Export downloaded successfully!', 'Close', { duration: 3000 });
                this.isExporting = false;
            },
            error: (error: any) => {
                this.snackBar.open('Failed to generate export', 'Close', { duration: 3000 });
                this.isExporting = false;
            }
        });
    }

    addTool(): void {
        this.generateFormData.tools.push({ name: '', version: '', type: 'SOFTWARE', purpose: '' });
    }

    removeTool(index: number): void {
        this.generateFormData.tools.splice(index, 1);
    }

    addModule(): void {
        this.generateFormData.modules.push({ name: '', functionality: '' });
    }

    removeModule(index: number): void {
        this.generateFormData.modules.splice(index, 1);
    }

    submitGenerateForm(): void {
        this.isGenerating = true;
        const req: any = {};
        if (this.generationMode === 'manual') {
            req.labCoordinatorName = this.generateFormData.labCoordinatorName;
            req.projectTrack = this.generateFormData.projectTrack;
            req.briefIntroduction = this.generateFormData.briefIntroduction;
            req.tools = this.generateFormData.tools;
            req.modules = this.generateFormData.modules;
            req.memberRoles = this.generateFormData.memberRoles;
            req.mentorName = this.generateFormData.mentorName;
        }

        this.documentService.generateForm(this.projectId, this.selectedFormType, req).subscribe({
            next: () => {
                this.snackBar.open(`Generated ${this.selectedFormType.toUpperCase()} successfully`, 'Close', { duration: 3000 });
                this.isGenerating = false;
                this.showGenerateUI = false; // Hide UI on success
                this.loadDocuments();
            },
            error: (error) => {
                const message = error?.error?.message || 'Error generating form';
                this.snackBar.open(message, 'Close', { duration: 3000 });
                this.isGenerating = false;
            }
        });
    }

    openUploadDialog(): void {
        const dialogRef = this.dialog.open(DocumentUploadComponent, {
            width: '600px',
            data: { projectId: this.projectId }
        });

        dialogRef.componentInstance.projectId = this.projectId;
        dialogRef.componentInstance.uploadComplete.subscribe(() => {
            this.loadDocuments();
            dialogRef.close();
        });
    }

    downloadDocument(doc: Document): void {
        if (doc.fileUrl) {
            window.open(doc.fileUrl, '_blank');
        } else {
            this.snackBar.open('Document URL not found', 'Close', { duration: 3000 });
        }
    }

    deleteDocument(doc: Document): void {
        if (confirm(`Delete ${doc.fileName}?`)) {
            this.documentService.deleteDocument(doc.documentId).subscribe({
                next: () => {
                    this.snackBar.open('Document deleted', 'Close', { duration: 2000 });
                    this.loadDocuments();
                },
                error: () => {
                    this.snackBar.open('Error deleting document', 'Close', { duration: 3000 });
                }
            });
        }
    }

    getFileIcon(fileName: string): string {
        return this.documentService.getFileIcon(fileName);
    }

    formatFileSize(bytes: number): string {
        return this.documentService.formatFileSize(bytes);
    }

    getStatusColor(status: DocumentStatus): string {
        switch (status) {
            case DocumentStatus.APPROVED: return 'green';
            case DocumentStatus.REJECTED: return 'red';
            case DocumentStatus.PENDING: return 'orange';
            default: return 'gray';
        }
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    approveDocument(doc: Document): void {
        if (confirm(`Approve ${doc.fileName}?`)) {
            this.documentService.approveDocument(doc.documentId).subscribe({
                next: () => {
                    this.snackBar.open('Document approved', 'Close', { duration: 2000 });
                    this.loadDocuments();
                },
                error: (error: any) => {
                    this.snackBar.open(error?.error?.message || 'Error approving document', 'Close', { duration: 3000 });
                }
            });
        }
    }

    openRejectDialog(doc: Document, templateRef: any): void {
        this.rejectingDoc = doc;
        this.rejectReason = '';
        this.dialog.open(templateRef, {
            width: '400px'
        });
    }

    submitReject(): void {
        if (!this.rejectingDoc || !this.rejectReason.trim()) return;

        this.isRejecting = true;
        this.documentService.rejectDocument(this.rejectingDoc.documentId, this.rejectReason).subscribe({
            next: () => {
                this.snackBar.open('Document rejected', 'Close', { duration: 2000 });
                this.isRejecting = false;
                this.dialog.closeAll();
                this.loadDocuments();
            },
            error: (error: any) => {
                this.snackBar.open(error?.error?.message || 'Error rejecting document', 'Close', { duration: 3000 });
                this.isRejecting = false;
            }
        });
    }

    closeRejectDialog(): void {
        this.dialog.closeAll();
        this.rejectingDoc = null;
        this.rejectReason = '';
    }
}
