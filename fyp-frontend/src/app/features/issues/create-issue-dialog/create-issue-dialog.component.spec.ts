import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateIssueDialogComponent } from './create-issue-dialog.component';
import { IssueService } from '../../../core/services/issue.service';

describe('CreateIssueDialogComponent', () => {
    let component: CreateIssueDialogComponent;
    let issueServiceSpy: jasmine.SpyObj<IssueService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateIssueDialogComponent>>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        issueServiceSpy = jasmine.createSpyObj('IssueService', ['createIssue']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        issueServiceSpy.createIssue.and.returnValue(of({
            issueId: 1,
            projectId: 1,
            title: 'New Issue',
            description: 'Issue description',
            status: 'OPEN',
            priority: 'HIGH',
            createdBy: 1,
            createdByName: 'John',
            createdAt: new Date()
        }));

        component = new CreateIssueDialogComponent(
            formBuilder, issueServiceSpy, dialogRefSpy, snackBarSpy, { projectId: 1 }
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form', () => {
        it('should have issue form', () => {
            expect(component.issueForm).toBeTruthy();
        });

        it('should have title field', () => {
            expect(component.issueForm.get('title')).toBeTruthy();
        });
    });

    describe('cancel', () => {
        it('should close dialog', () => {
            component.cancel();
            expect(dialogRefSpy.close).toHaveBeenCalled();
        });
    });
});
