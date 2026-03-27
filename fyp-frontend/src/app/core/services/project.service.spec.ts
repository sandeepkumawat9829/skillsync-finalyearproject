import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProjectService } from './project.service';
import { Project, CollegeProjectBucket, CreateProjectRequest } from '../models/project.model';

describe('ProjectService', () => {
    let service: ProjectService;
    let httpMock: HttpTestingController;

    const mockProject: Project = {
        projectId: 1,
        title: 'Test Project',
        abstractText: 'Test Abstract',
        fullDescription: 'Test Full Description',
        status: 'IN_PROGRESS',
        domain: 'Web Development',
        technologies: ['Angular', 'Spring Boot'],
        createdBy: 1,
        createdByName: 'Test Owner',
        visibility: 'PUBLIC',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockProjects: Project[] = [
        mockProject,
        { ...mockProject, projectId: 2, title: 'Second Project' }
    ];

    const mockBucket: CollegeProjectBucket = {
        bucketId: 1,
        title: 'AI/ML Projects',
        description: 'Projects related to Artificial Intelligence',
        department: 'Computer Science',
        difficultyLevel: 'HARD',
        technologies: ['Python', 'TensorFlow'],
        maxTeams: 5,
        allocatedTeams: 2,
        isAvailable: true,
        postedBy: 1,
        postedAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProjectService]
        });
        service = TestBed.inject(ProjectService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getProjects', () => {
        it('should fetch public projects', () => {
            service.getProjects().subscribe(projects => {
                expect(projects.length).toBe(2);
                expect(projects).toEqual(mockProjects);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/public');
            expect(req.request.method).toBe('GET');
            req.flush(mockProjects);
        });

        it('should send filters as query params', () => {
            const filters = { status: 'COMPLETED', domain: 'Web' };

            service.getProjects(filters).subscribe();

            const req = httpMock.expectOne(request =>
                request.url === 'https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/public' &&
                request.params.get('status') === 'COMPLETED' &&
                request.params.get('domain') === 'Web'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockProjects);
        });
    });

    describe('getProjectById', () => {
        it('should fetch a single project by ID', () => {
            service.getProjectById(1).subscribe(project => {
                expect(project).toEqual(mockProject);
                expect(project.projectId).toBe(1);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockProject);
        });
    });

    describe('createProject', () => {
        it('should send POST request to create project', () => {
            const newProject: CreateProjectRequest = {
                title: 'New Project',
                abstractText: 'New Abstract',
                fullDescription: 'New Full Description',
                domain: 'Mobile Development',
                technologies: ['React Native'],
                visibility: 'PUBLIC'
            };

            service.createProject(newProject).subscribe(project => {
                expect(project).toEqual(mockProject);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newProject);
            req.flush(mockProject);
        });
    });

    describe('updateProject', () => {
        it('should send PUT request to update project', () => {
            const updates: Partial<CreateProjectRequest> = {
                title: 'Updated Title',
                fullDescription: 'Updated Description'
            };

            service.updateProject(1, updates).subscribe(project => {
                expect(project).toEqual(mockProject);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updates);
            req.flush(mockProject);
        });
    });

    describe('deleteProject', () => {
        it('should send DELETE request', () => {
            service.deleteProject(1).subscribe();

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getProjectBuckets', () => {
        it('should fetch project buckets', () => {
            const buckets: CollegeProjectBucket[] = [mockBucket];

            service.getProjectBuckets().subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0]).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/buckets');
            expect(req.request.method).toBe('GET');
            req.flush(buckets);
        });

        it('should return empty array on error', () => {
            service.getProjectBuckets().subscribe(result => {
                expect(result).toEqual([]);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/buckets');
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('getMyProjects', () => {
        it('should fetch current user projects', () => {
            service.getMyProjects().subscribe(projects => {
                expect(projects).toEqual(mockProjects);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/my');
            expect(req.request.method).toBe('GET');
            req.flush(mockProjects);
        });
    });

    describe('getProjectsByStatus', () => {
        it('should fetch projects filtered by status', () => {
            service.getProjectsByStatus('COMPLETED').subscribe(projects => {
                expect(projects).toEqual(mockProjects);
            });

            const req = httpMock.expectOne('https://outermost-leisha-noncoherently.ngrok-free.de/api/projects/status/COMPLETED');
            expect(req.request.method).toBe('GET');
            req.flush(mockProjects);
        });
    });
});
