import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamListComponent } from './team-list.component';
import { TeamService } from '../../../core/services/team.service';
import { Team } from '../../../core/models/project.model';

describe('TeamListComponent', () => {
    let component: TeamListComponent;
    let teamServiceSpy: jasmine.SpyObj<TeamService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockTeams: Team[] = [
        {
            teamId: 1,
            teamName: 'Team Alpha',
            projectId: 1,
            teamLeaderId: 1,
            members: [],
            currentMemberCount: 4,
            maxMembers: 4,
            isComplete: true,
            status: 'ACTIVE',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        teamServiceSpy = jasmine.createSpyObj('TeamService', ['getMyTeams']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        teamServiceSpy.getMyTeams.and.returnValue(of(mockTeams));

        component = new TeamListComponent(teamServiceSpy, routerSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load teams on init', () => {
            component.ngOnInit();
            expect(teamServiceSpy.getMyTeams).toHaveBeenCalled();
        });

        it('should populate teams array', () => {
            component.ngOnInit();
            expect(component.teams.length).toBe(1);
        });
    });

    describe('Navigation', () => {
        it('should navigate to team view', () => {
            component.viewTeam(1);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams', 1]);
        });

        it('should navigate to create team', () => {
            component.createTeam();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/teams/create']);
        });
    });

    describe('getStatusClass', () => {
        it('should return complete for COMPLETE status', () => {
            expect(component.getStatusClass('COMPLETE')).toBe('complete');
        });

        it('should return active for ACTIVE status', () => {
            expect(component.getStatusClass('ACTIVE')).toBe('active');
        });

        it('should return forming for FORMING status', () => {
            expect(component.getStatusClass('FORMING')).toBe('forming');
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadTeams', () => {
            teamServiceSpy.getMyTeams.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadTeams()).not.toThrow();
        });
    });
});
