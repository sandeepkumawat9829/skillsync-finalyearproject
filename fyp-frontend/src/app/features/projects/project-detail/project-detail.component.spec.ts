import { of } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectDetailComponent } from './project-detail.component';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeamService } from '../../../core/services/team.service';

describe('ProjectDetailComponent', () => {
    let component: ProjectDetailComponent;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockProject = {
        projectId: 1,
        title: 'AI Project',
        abstractText: 'An AI project',
        fullDescription: 'Full description of AI project',
        status: 'TEAM_FORMING',
        domain: 'AI_ML',
        technologies: ['Python', 'TensorFlow'],
        createdById: 1,
        visibility: 'PUBLIC',
        createdAt: new Date().toISOString(),
        teamId: 10,
        teamName: 'AI Project Team',
        teamStatus: 'FORMING',
        teamMemberCount: 1,
        hasMentor: false
    };

    const mockTeam = {
        teamId: 10,
        teamName: 'AI Project Team',
        projectId: 1,
        teamLeaderId: 1,
        members: [],
        currentMemberCount: 1,
        maxMembers: 4,
        isComplete: false,
        status: 'FORMING',
        createdAt: new Date()
    };

    beforeEach(() => {
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjectById', 'deleteProject']);
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['getTeamByProject']);
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            currentUserValue: { userId: 1, email: 'student@example.com', role: 'STUDENT' }
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        projectServiceSpy.getProjectById.and.returnValue(of(mockProject as any));
        teamServiceSpy.getTeamByProject.and.returnValue(of(mockTeam as any));

        const mockActivatedRoute = {
            params: of({ id: 1 })
        } as any;

        component = new ProjectDetailComponent(
            mockActivatedRoute,
            routerSpy,
            projectServiceSpy,
            teamServiceSpy,
            authServiceSpy,
            snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load project and team on init', () => {
        component.ngOnInit();

        expect(projectServiceSpy.getProjectById).toHaveBeenCalledWith(1, 1);
        expect(teamServiceSpy.getTeamByProject).toHaveBeenCalledWith(1);
        expect(component.project?.title).toBe('AI Project');
        expect(component.isOwner).toBeTrue();
    });

    it('should navigate to team detail when team exists', () => {
        component.team = mockTeam as any;

        component.createTeam();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams', 10]);
    });

    it('should navigate to mentor browse when mentor can be requested', () => {
        component.project = mockProject as any;
        component.team = { ...mockTeam, status: 'COMPLETE', isComplete: true } as any;
        component['isOwner'] = true;

        component.findMentor();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/mentors'], {
            queryParams: { projectId: 1 }
        });
    });

    it('should navigate back to projects', () => {
        component.goBack();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/projects']);
    });
});
