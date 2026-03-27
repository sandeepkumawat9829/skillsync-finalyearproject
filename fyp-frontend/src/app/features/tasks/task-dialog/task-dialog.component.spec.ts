import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskDialogComponent } from './task-dialog.component';
import { TaskService } from '../../../core/services/task.service';

describe('TaskDialogComponent', () => {
    let component: TaskDialogComponent;
    let taskServiceSpy: jasmine.SpyObj<TaskService>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TaskDialogComponent>>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        taskServiceSpy = jasmine.createSpyObj('TaskService', ['createTask']);
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        taskServiceSpy.createTask.and.returnValue(of({
            taskId: 1,
            projectId: 1,
            title: 'New Task',
            description: 'Task description',
            status: 'TODO',
            priority: 'MEDIUM',
            createdBy: 1,
            createdByName: 'John',
            createdAt: new Date()
        }));

        component = new TaskDialogComponent(
            formBuilder, taskServiceSpy, dialogRefSpy, snackBarSpy, { projectId: 1 }
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form', () => {
        it('should have task form', () => {
            expect(component.taskForm).toBeTruthy();
        });

        it('should have title field', () => {
            expect(component.taskForm.get('title')).toBeTruthy();
        });
    });

    describe('cancel', () => {
        it('should close dialog', () => {
            component.cancel();
            expect(dialogRefSpy.close).toHaveBeenCalled();
        });
    });
});
