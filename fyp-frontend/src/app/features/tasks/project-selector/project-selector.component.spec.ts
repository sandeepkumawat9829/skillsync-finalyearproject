import { of } from 'rxjs';
import { ProjectSelectorComponent } from './project-selector.component';
import { ProjectService } from '../../../core/services/project.service';

describe('ProjectSelectorComponent', () => {
    let component: ProjectSelectorComponent;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;

    const mockProjects = [
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
        }
    ];

    beforeEach(() => {
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getMyProjects']);
        projectServiceSpy.getMyProjects.and.returnValue(of(mockProjects));

        component = new ProjectSelectorComponent(projectServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load projects on init', () => {
            component.ngOnInit();
            expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
        });

        it('should populate projects array', () => {
            component.ngOnInit();
            expect(component.projects.length).toBe(1);
        });
    });

    describe('selectProject', () => {
        it('should emit selected event', () => {
            spyOn(component.projectSelected, 'emit');
            component.selectProject(1);
            expect(component.projectSelected.emit).toHaveBeenCalledWith(1);
        });
    });
});
