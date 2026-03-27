import { of, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectCreateComponent } from './project-create.component';
import { ProjectService } from '../../../core/services/project.service';

describe('ProjectCreateComponent', () => {
    let component: ProjectCreateComponent;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['createProject']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        projectServiceSpy.createProject.and.returnValue(of({
            projectId: 1,
            title: 'New Project',
            abstractText: 'Abstract',
            fullDescription: 'Description',
            status: 'DRAFT',
            domain: 'WEB_APP',
            technologies: ['Angular'],
            createdBy: 1,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        component = new ProjectCreateComponent(formBuilder, projectServiceSpy, routerSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize project form on init', () => {
            component.ngOnInit();
            expect(component.projectForm).toBeTruthy();
        });

        it('should have title field', () => {
            component.ngOnInit();
            expect(component.projectForm.get('title')).toBeTruthy();
        });

        it('should have domain field', () => {
            component.ngOnInit();
            expect(component.projectForm.get('domain')).toBeTruthy();
        });
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should require title', () => {
            expect(component.projectForm.get('title')?.hasError('required')).toBeTrue();
        });

        it('should require abstract', () => {
            expect(component.projectForm.get('abstractText')?.hasError('required')).toBeTrue();
        });
    });

    describe('Form Submission', () => {
        beforeEach(() => {
            component.ngOnInit();
        });

        it('should not submit invalid form', () => {
            component.onSubmit();
            expect(projectServiceSpy.createProject).not.toHaveBeenCalled();
        });

        it('should navigate to projects on success', () => {
            component.projectForm.patchValue({
                title: 'Test Project',
                abstractText: 'Abstract',
                fullDescription: 'Description',
                domain: 'WEB_APP',
                technologies: ['Angular'],
                visibility: 'PUBLIC'
            });
            component.onSubmit();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects']);
        });
    });

    describe('cancel', () => {
        it('should navigate back to projects', () => {
            component.cancel();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects']);
        });
    });
});
