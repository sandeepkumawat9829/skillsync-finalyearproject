import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { TeamCreateComponent } from './team-create.component';
import { TeamService } from '../../../core/services/team.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project, Team } from '../../../core/models/project.model';

describe('TeamCreateComponent', () => {
    let component: TeamCreateComponent;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    const mockProjects: Project[] = [
        {
            projectId: 1,
            title: 'Test Project',
            abstractText: 'Abstract',
            fullDescription: 'Description',
            status: 'DRAFT',
            domain: 'WEB_APP',
            technologies: ['Angular'],
            createdBy: 1,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const mockTeam: Team = {
        teamId: 1,
        teamName: 'Team Alpha',
        projectId: 1,
        teamLeaderId: 1,
        maxMembers: 4,
        currentMemberCount: 1,
        isComplete: false,
        status: 'FORMING',
        members: [],
        createdAt: new Date()
    };

    beforeEach(() => {
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['createTeam']);
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getMyProjects']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        formBuilder = new FormBuilder();

        projectServiceSpy.getMyProjects.and.returnValue(of(mockProjects));

        const mockActivatedRoute = {
            queryParams: of({})
        } as any;

        component = new TeamCreateComponent(
            formBuilder,
            teamServiceSpy,
            projectServiceSpy,
            routerSpy,
            mockActivatedRoute,
            snackBarSpy
        );
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize team form', () => {
            expect(component.teamForm).toBeTruthy();
        });

        it('should have teamName control with validators', () => {
            const teamName = component.teamForm.get('teamName');
            expect(teamName?.hasError('required')).toBeTrue();

            teamName?.setValue('AB');
            expect(teamName?.hasError('minlength')).toBeTrue();

            teamName?.setValue('Valid Team Name');
            expect(teamName?.valid).toBeTrue();
        });

        it('should have projectId control as required', () => {
            const projectId = component.teamForm.get('projectId');
            expect(projectId?.hasError('required')).toBeTrue();
        });

        it('should have maxMembers with default value 4', () => {
            expect(component.teamForm.get('maxMembers')?.value).toBe(4);
        });

        it('should validate maxMembers range (2-10)', () => {
            const maxMembers = component.teamForm.get('maxMembers');

            maxMembers?.setValue(1);
            expect(maxMembers?.hasError('min')).toBeTrue();

            maxMembers?.setValue(11);
            expect(maxMembers?.hasError('max')).toBeTrue();

            maxMembers?.setValue(5);
            expect(maxMembers?.valid).toBeTrue();
        });
    });

    describe('Project Loading', () => {
        it('should load projects on init', () => {
            expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
        });

        it('should populate projects array', () => {
            expect(component.projects.length).toBe(1);
        });

        it('should handle project loading error', () => {
            projectServiceSpy.getMyProjects.and.returnValue(throwError(() => new Error('Error')));
            component.loadProjects();
            expect(snackBarSpy.open).toHaveBeenCalledWith('Error loading projects', 'Close', jasmine.any(Object));
        });
    });

    describe('Form Submission', () => {
        it('should not submit if form is invalid', () => {
            component.onSubmit();
            expect(teamServiceSpy.createTeam).not.toHaveBeenCalled();
        });

        it('should show snackbar on invalid form', () => {
            component.onSubmit();
            expect(snackBarSpy.open).toHaveBeenCalledWith('Please fill all required fields', 'Close', jasmine.any(Object));
        });

        it('should call TeamService.createTeam on valid submission', () => {
            teamServiceSpy.createTeam.and.returnValue(of(mockTeam));

            component.teamForm.setValue({
                teamName: 'Test Team',
                projectId: 1,
                maxMembers: 4
            });

            component.onSubmit();

            expect(teamServiceSpy.createTeam).toHaveBeenCalledWith({
                teamName: 'Test Team',
                projectId: 1,
                maxMembers: 4
            });
        });

        it('should navigate to teams list on success', () => {
            teamServiceSpy.createTeam.and.returnValue(of(mockTeam));

            component.teamForm.setValue({
                teamName: 'Test Team',
                projectId: 1,
                maxMembers: 4
            });

            component.onSubmit();

            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams']);
        });

        it('should show error snackbar on failure', () => {
            teamServiceSpy.createTeam.and.returnValue(throwError(() => new Error('Error')));

            component.teamForm.setValue({
                teamName: 'Test Team',
                projectId: 1,
                maxMembers: 4
            });

            component.onSubmit();

            expect(snackBarSpy.open).toHaveBeenCalledWith('Error creating team', 'Close', jasmine.any(Object));
        });
    });

    describe('Cancel', () => {
        it('should navigate to teams list on cancel', () => {
            component.cancel();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams']);
        });
    });

    describe('Helper Methods', () => {
        it('should find project by ID', () => {
            const project = component.getProjectById(1);
            expect(project).toBeTruthy();
            expect(project?.title).toBe('Test Project');
        });

        it('should return undefined for non-existent project', () => {
            const project = component.getProjectById(999);
            expect(project).toBeUndefined();
        });
    });
});
