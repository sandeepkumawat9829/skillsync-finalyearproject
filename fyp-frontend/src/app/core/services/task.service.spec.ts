import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

describe('TaskService', () => {
    let service: TaskService;
    let httpMock: HttpTestingController;

    const mockTask: Task = {
        taskId: 1,
        projectId: 1,
        teamId: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        priority: 'HIGH',
        assignedTo: 1,
        assignedToName: 'John Doe',
        createdBy: 1,
        createdByName: 'Jane Smith',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TaskService]
        });
        service = TestBed.inject(TaskService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getTasksByProject', () => {
        it('should fetch tasks by project ID', () => {
            const tasks = [mockTask];

            service.getTasksByProject(1).subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0].projectId).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/project/1');
            expect(req.request.method).toBe('GET');
            req.flush(tasks);
        });
    });

    describe('getTaskById', () => {
        it('should fetch a single task by ID', () => {
            service.getTaskById(1).subscribe(task => {
                expect(task).toEqual(mockTask);
                expect(task.taskId).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockTask);
        });
    });

    describe('createTask', () => {
        it('should send POST request to create task', () => {
            const newTask: CreateTaskRequest = {
                projectId: 1,
                title: 'New Task',
                description: 'Description',
                priority: 'MEDIUM'
            };

            service.createTask(newTask).subscribe(task => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newTask);
            req.flush(mockTask);
        });
    });

    describe('updateTask', () => {
        it('should send PUT request to update task', () => {
            const updates: UpdateTaskRequest = {
                title: 'Updated Task',
                status: 'IN_PROGRESS'
            };

            service.updateTask(1, updates).subscribe(task => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updates);
            req.flush(mockTask);
        });
    });

    describe('updateTaskStatus', () => {
        it('should send PATCH request to move task status', () => {
            service.updateTaskStatus(1, 'IN_PROGRESS').subscribe(task => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/1/move');
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual({ status: 'IN_PROGRESS' });
            req.flush(mockTask);
        });
    });

    describe('deleteTask', () => {
        it('should send DELETE request', () => {
            service.deleteTask(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getMyTasks', () => {
        it('should fetch tasks assigned to current user', () => {
            const tasks = [mockTask];

            service.getMyTasks().subscribe(result => {
                expect(result.length).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/my');
            expect(req.request.method).toBe('GET');
            req.flush(tasks);
        });
    });

    describe('getTasksBySprint', () => {
        it('should fetch tasks by sprint ID', () => {
            const tasks = [mockTask];

            service.getTasksBySprint(1).subscribe(result => {
                expect(result.length).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/sprint/1');
            expect(req.request.method).toBe('GET');
            req.flush(tasks);
        });
    });

    describe('assignTask', () => {
        it('should send PUT request to assign task to user', () => {
            service.assignTask(1, 5).subscribe(task => {
                expect(task).toEqual(mockTask);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/tasks/1/assign');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ userId: 5 });
            req.flush(mockTask);
        });
    });
});
