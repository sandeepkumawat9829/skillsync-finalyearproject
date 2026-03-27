import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { ProjectListComponent } from './project-list.component';
import { BucketService } from '../../../core/services/bucket.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';

describe('ProjectListComponent', () => {
    let component: ProjectListComponent;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let bucketServiceSpy: jasmine.SpyObj<BucketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockProjects: Project[] = [
        {
            projectId: 1,
            title: 'AI Project',
            abstractText: 'An AI project',
            fullDescription: 'Full description',
            status: 'IN_PROGRESS',
            domain: 'AI_ML',
            technologies: ['Python'],
            createdBy: 1,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            projectId: 2,
            title: 'Web App',
            abstractText: 'A web application',
            fullDescription: 'Full description',
            status: 'DRAFT',
            domain: 'WEB_APP',
            technologies: ['Angular'],
            createdBy: 1,
            visibility: 'PUBLIC',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    beforeEach(() => {
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjects', 'getMyProjects']);
        bucketServiceSpy = jasmine.createSpyObj('BucketService', ['getAvailableBuckets']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        projectServiceSpy.getProjects.and.returnValue(of(mockProjects));
        projectServiceSpy.getMyProjects.and.returnValue(of(mockProjects));
        bucketServiceSpy.getAvailableBuckets.and.returnValue(of([]));

        component = new ProjectListComponent(projectServiceSpy, bucketServiceSpy, routerSpy, snackBarSpy);
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load projects on init', () => {
            expect(projectServiceSpy.getProjects).toHaveBeenCalled();
        });

        it('should load buckets on init', () => {
            expect(bucketServiceSpy.getAvailableBuckets).toHaveBeenCalled();
        });

        it('should have domains array', () => {
            expect(component.domains).toContain('ALL');
            expect(component.domains).toContain('AI_ML');
            expect(component.domains).toContain('WEB_APP');
        });

        it('should have statuses array', () => {
            expect(component.statuses).toContain('ALL');
            expect(component.statuses).toContain('DRAFT');
            expect(component.statuses).toContain('IN_PROGRESS');
        });
    });

    describe('Filtering', () => {
        it('should filter by search query', () => {
            component.searchQuery = 'AI';
            component.applyFilters();
            expect(component.filteredProjects.length).toBe(1);
            expect(component.filteredProjects[0].title).toBe('AI Project');
        });

        it('should filter by domain', () => {
            component.selectedDomain = 'WEB_APP';
            component.applyFilters();
            expect(component.filteredProjects.length).toBe(1);
            expect(component.filteredProjects[0].domain).toBe('WEB_APP');
        });

        it('should filter by status', () => {
            component.selectedStatus = 'DRAFT';
            component.applyFilters();
            expect(component.filteredProjects.length).toBe(1);
            expect(component.filteredProjects[0].status).toBe('DRAFT');
        });

        it('should show all projects with ALL filters', () => {
            component.selectedDomain = 'ALL';
            component.selectedStatus = 'ALL';
            component.searchQuery = '';
            component.applyFilters();
            expect(component.filteredProjects.length).toBe(2);
        });
    });

    describe('Tab Changes', () => {
        it('should load my projects on tab 1', () => {
            component.onTabChange({ index: 1 });
            expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
        });

        it('should load all projects on tab 0', () => {
            projectServiceSpy.getProjects.calls.reset();
            component.onTabChange({ index: 0 });
            expect(projectServiceSpy.getProjects).toHaveBeenCalled();
        });
    });

    describe('Navigation', () => {
        it('should navigate to project detail', () => {
            component.viewProject(1);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects', 1]);
        });

        it('should navigate to create project', () => {
            component.createProject();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects/create']);
        });
    });

    describe('Utility Methods', () => {
        it('should return correct domain icons', () => {
            expect(component.getDomainIcon('AI_ML')).toBe('psychology');
            expect(component.getDomainIcon('WEB_APP')).toBe('web');
            expect(component.getDomainIcon('MOBILE_APP')).toBe('phone_android');
            expect(component.getDomainIcon('IOT')).toBe('devices');
            expect(component.getDomainIcon('UNKNOWN')).toBe('folder');
        });

        it('should return correct status colors', () => {
            expect(component.getStatusColor('DRAFT')).toBe('gray');
            expect(component.getStatusColor('IN_PROGRESS')).toBe('orange');
            expect(component.getStatusColor('COMPLETED')).toBe('purple');
            expect(component.getStatusColor('UNKNOWN')).toBe('gray');
        });

        it('should return correct difficulty classes', () => {
            expect(component.getDifficultyClass('EASY')).toBe('easy');
            expect(component.getDifficultyClass('MEDIUM')).toBe('medium');
            expect(component.getDifficultyClass('HARD')).toBe('hard');
        });
    });

    describe('Error Handling', () => {
        it('should show error snackbar on projects load failure', () => {
            projectServiceSpy.getProjects.and.returnValue(throwError(() => new Error('Error')));
            component.loadProjects();
            expect(snackBarSpy.open).toHaveBeenCalledWith('Error loading projects', 'Close', jasmine.any(Object));
        });
    });
});
