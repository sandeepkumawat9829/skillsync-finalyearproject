import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskBoardComponent } from './task-board.component';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { Task } from '../../../core/models/task.model';

describe('TaskBoardComponent', () => {
    let component: TaskBoardComponent;
    let taskServiceSpy: jasmine.SpyObj<TaskService>;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let dialogSpy: jasmine.SpyObj<MatDialog>;

    const mockTasks: Task[] = [
        {
            taskId: 1,
            projectId: 1,
            title: 'Task 1',
            description: 'Do something',
            status: 'TODO',
            priority: 'HIGH',
            createdBy: 1,
            createdByName: 'John',
            createdAt: new Date()
        },
        {
            taskId: 2,
            projectId: 1,
            title: 'Task 2',
            description: 'Do something else',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            createdBy: 1,
            createdByName: 'John',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasksByProject', 'updateTaskStatus']);
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjectById']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        taskServiceSpy.getTasksByProject.and.returnValue(of(mockTasks));
        projectServiceSpy.getProjectById.and.returnValue(of({
            projectId: 1,
            title: 'Test Project',
            abstractText: 'Test',
            fullDescription: 'Test',
            status: 'IN_PROGRESS',
            domain: 'WEB_APP',
            technologies: [],
            createdBy: 1,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        const mockActivatedRoute = {
            queryParams: of({ projectId: '1' })
        } as any;

        component = new TaskBoardComponent(
            mockActivatedRoute, routerSpy, taskServiceSpy: taskServiceSpy,
            projectServiceSpy, snackBarSpy, dialogSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should have 4 columns', () => {
            expect(component.columns.length).toBe(4);
        });

        it('should have TODO column', () => {
            expect(component.columns.some(c => c.id === 'TODO')).toBeTrue();
        });

        it('should have IN_PROGRESS column', () => {
            expect(component.columns.some(c => c.id === 'IN_PROGRESS')).toBeTrue();
        });
    });

    describe('organizeTasks', () => {
        it('should distribute tasks to correct columns', () => {
            component.organizeTasks(mockTasks);
            const todoColumn = component.columns.find(c => c.id === 'TODO');
            expect(todoColumn?.tasks.length).toBe(1);
        });
    });

    describe('goToAnalytics', () => {
        it('should navigate to analytics', () => {
            component.projectId = 1;
            component.goToAnalytics();
            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['/student/tasks/analytics'],
                { queryParams: { projectId: 1 } }
            );
        });
    });

    describe('goBack', () => {
        it('should navigate to projects', () => {
            component.goBack();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects']);
        });
    });

    describe('getColumnClass', () => {
        it('should return todo-column for TODO', () => {
            expect(component.getColumnClass('TODO')).toBe('todo-column');
        });

        it('should return progress-column for IN_PROGRESS', () => {
            expect(component.getColumnClass('IN_PROGRESS')).toBe('progress-column');
        });

        it('should return done-column for DONE', () => {
            expect(component.getColumnClass('DONE')).toBe('done-column');
        });
    });

    describe('getPriorityColor', () => {
        it('should return red for CRITICAL', () => {
            expect(component.getPriorityColor('CRITICAL')).toBe('red');
        });

        it('should return orange for HIGH', () => {
            expect(component.getPriorityColor('HIGH')).toBe('orange');
        });

        it('should return gray for LOW', () => {
            expect(component.getPriorityColor('LOW')).toBe('gray');
        });
    });

    describe('isOverdue', () => {
        it('should return false for DONE task', () => {
            const doneTask = { ...mockTasks[0], status: 'DONE' as const, dueDate: new Date(Date.now() - 86400000) };
            expect(component.isOverdue(doneTask)).toBeFalse();
        });

        it('should return false for task without dueDate', () => {
            expect(component.isOverdue(mockTasks[0])).toBeFalse();
        });
    });

    describe('connectedDropLists', () => {
        it('should return all column IDs', () => {
            expect(component.connectedDropLists.length).toBe(4);
        });
    });
});
