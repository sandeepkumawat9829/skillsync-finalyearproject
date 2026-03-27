import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateSprintDialogComponent } from './create-sprint-dialog.component';
import { SprintService } from '../../../core/services/sprint.service';

describe('CreateSprintDialogComponent', () => {
    let component: CreateSprintDialogComponent;
    let sprintServiceSpy: jasmine.SpyObj<SprintService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateSprintDialogComponent>>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        sprintServiceSpy = jasmine.createSpyObj('SprintService', ['createSprint']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        sprintServiceSpy.createSprint.and.returnValue(of({
            sprintId: 1,
            projectId: 1,
            sprintNumber: 1,
            sprintName: 'Sprint 1',
            goal: 'Complete features',
            startDate: new Date(),
            endDate: new Date(),
            status: 'PLANNED',
            totalTasks: 0,
            completedTasks: 0,
            createdAt: new Date()
        }));

        component = new CreateSprintDialogComponent(
            formBuilder, sprintServiceSpy, dialogRefSpy, snackBarSpy, { projectId: 1 }
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should have sprint form', () => {
            expect(component.sprintForm).toBeTruthy();
        });

        it('should have sprintName field', () => {
            expect(component.sprintForm.get('sprintName')).toBeTruthy();
        });
    });

    describe('cancel', () => {
        it('should close dialog', () => {
            component.cancel();
            expect(dialogRefSpy.close).toHaveBeenCalled();
        });
    });
});
