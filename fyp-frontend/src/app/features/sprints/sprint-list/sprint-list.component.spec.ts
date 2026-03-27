import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SprintListComponent } from './sprint-list.component';
import { SprintService } from '../../../core/services/sprint.service';
import { ProjectService } from '../../../core/services/project.service';
import { Sprint, SprintStatus } from '../../../core/models/sprint.model';

describe('SprintListComponent', () => {
    let component: SprintListComponent;
    let sprintServiceSpy: jasmine.SpyObj<SprintService>;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockSprints: Sprint[] = [
        {
            sprintId: 1,
            projectId: 1,
            sprintNumber: 1,
            sprintName: 'Sprint 1',
            goal: 'Complete initial features',
            startDate: new Date(),
            endDate: new Date(),
            status: SprintStatus.ACTIVE,
            totalTasks: 10,
            completedTasks: 5,
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        sprintServiceSpy = jasmine.createSpyObj('SprintService', [
            'getSprintsByProject', 'completeSprint', 'getProgressPercentage', 'getDaysRemaining'
        ]);
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        sprintServiceSpy.getSprintsByProject.and.returnValue(of(mockSprints));
        sprintServiceSpy.getProgressPercentage.and.returnValue(50);
        sprintServiceSpy.getDaysRemaining.and.returnValue(7);
        projectServiceSpy.getProjects.and.returnValue(of([]));

        component = new SprintListComponent(
            sprintServiceSpy, projectServiceSpy, dialogSpy, routerSpy, snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load projects on init', () => {
            component.ngOnInit();
            expect(projectServiceSpy.getProjects).toHaveBeenCalled();
        });

        it('should load sprints on init', () => {
            component.ngOnInit();
            expect(sprintServiceSpy.getSprintsByProject).toHaveBeenCalled();
        });
    });

    describe('filterSprints', () => {
        beforeEach(() => {
            component.sprints = mockSprints;
        });

        it('should show all sprints for tab 0', () => {
            component.selectedTab = 0;
            component.filterSprints();
            expect(component.filteredSprints.length).toBe(1);
        });

        it('should filter active sprints for tab 1', () => {
            component.selectedTab = 1;
            component.filterSprints();
            expect(component.filteredSprints.every(s => s.status === SprintStatus.ACTIVE)).toBeTrue();
        });
    });

    describe('onTabChange', () => {
        it('should update selectedTab and filter', () => {
            component.sprints = mockSprints;
            component.onTabChange(1);
            expect(component.selectedTab).toBe(1);
        });
    });

    describe('viewSprintBoard', () => {
        it('should navigate to task board', () => {
            component.projectId = 1;
            component.viewSprintBoard(mockSprints[0]);
            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['/student/tasks/board'],
                { queryParams: { projectId: 1, sprintId: 1 } }
            );
        });
    });

    describe('Utility Methods', () => {
        it('should format date correctly', () => {
            const result = component.formatDate(new Date('2026-01-15'));
            expect(result).toContain('Jan');
        });

        it('should get status class', () => {
            expect(component.getStatusClass(SprintStatus.ACTIVE)).toBe('active');
            expect(component.getStatusClass(SprintStatus.COMPLETED)).toBe('completed');
            expect(component.getStatusClass(SprintStatus.PLANNED)).toBe('planned');
        });

        it('should get progress percentage', () => {
            const result = component.getProgressPercentage(mockSprints[0]);
            expect(result).toBe(50);
        });
    });
});
