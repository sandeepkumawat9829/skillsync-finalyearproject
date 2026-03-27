import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { Team, TeamMember, InviteMemberRequest } from '../models/project.model';
import { TeamInvitation } from '../models/invitation.model';

describe('TeamService', () => {
    let service: TeamService;
    let httpMock: HttpTestingController;

    const mockMember: TeamMember = {
        memberId: 1,
        teamId: 1,
        userId: 1,
        fullName: 'John Doe',
        userEmail: 'john@example.com',
        role: 'LEADER',
        joinedAt: new Date()
    };

    const mockTeam: Team = {
        teamId: 1,
        teamName: 'Team Alpha',
        projectId: 1,
        projectTitle: 'Test Project',
        teamLeaderId: 1,
        maxMembers: 4,
        currentMemberCount: 2,
        isComplete: false,
        status: 'FORMING',
        members: [mockMember],
        createdAt: new Date()
    };

    const mockInvitation: TeamInvitation = {
        invitationId: 1,
        teamId: 1,
        teamName: 'Team Alpha',
        fromUserId: 1,
        fromUserName: 'John Doe',
        toUserId: 2,
        status: 'PENDING',
        createdAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TeamService]
        });
        service = TestBed.inject(TeamService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getTeamByProject', () => {
        it('should fetch team by project ID', () => {
            service.getTeamByProject(1).subscribe(team => {
                expect(team).toEqual(mockTeam);
                expect(team.projectId).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/project/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockTeam);
        });
    });

    describe('getMyTeam', () => {
        it('should fetch current user team', () => {
            service.getMyTeam().subscribe(team => {
                expect(team).toEqual(mockTeam);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/my');
            expect(req.request.method).toBe('GET');
            req.flush(mockTeam);
        });
    });

    describe('getTeamById', () => {
        it('should fetch team by ID', () => {
            service.getTeamById(1).subscribe(team => {
                expect(team.teamId).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockTeam);
        });
    });

    describe('getIncompleteTeams', () => {
        it('should fetch teams that can accept new members', () => {
            const incompleteTeams: Team[] = [mockTeam];

            service.getIncompleteTeams().subscribe(teams => {
                expect(teams.length).toBe(1);
                expect(teams[0].isComplete).toBeFalse();
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/incomplete');
            expect(req.request.method).toBe('GET');
            req.flush(incompleteTeams);
        });
    });

    describe('sendInvitation', () => {
        it('should send POST request to invite member', () => {
            const request: InviteMemberRequest = {
                teamId: 1,
                toUserId: 2,
                message: 'Please join our team'
            };

            service.sendInvitation(1, request).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/1/invite');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(request);
            req.flush(null);
        });
    });

    describe('getMyInvitations', () => {
        it('should fetch pending invitations for current user', () => {
            const invitations: TeamInvitation[] = [mockInvitation];

            service.getMyInvitations().subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0].status).toBe('PENDING');
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/invitations');
            expect(req.request.method).toBe('GET');
            req.flush(invitations);
        });
    });

    describe('acceptInvitation', () => {
        it('should send POST request to accept invitation', () => {
            service.acceptInvitation(1).subscribe(team => {
                expect(team).toEqual(mockTeam);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/invitations/1/accept');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({});
            req.flush(mockTeam);
        });
    });

    describe('rejectInvitation', () => {
        it('should send POST request to reject invitation', () => {
            service.rejectInvitation(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/invitations/1/reject');
            expect(req.request.method).toBe('POST');
            req.flush(null);
        });
    });

    describe('createTeam', () => {
        it('should send POST request to create team', () => {
            const teamData = {
                teamName: 'New Team',
                projectId: 1,
                maxMembers: 4
            };

            service.createTeam(teamData).subscribe(team => {
                expect(team).toEqual(mockTeam);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(teamData);
            req.flush(mockTeam);
        });
    });

    describe('removeMember', () => {
        it('should send DELETE request to remove member from team', () => {
            service.removeMember(1, 2).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/1/members/2');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('deleteTeam', () => {
        it('should send DELETE request to delete team', () => {
            service.deleteTeam(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getMyTeams', () => {
        it('should return array with single team from getMyTeam', () => {
            service.getMyTeams().subscribe(teams => {
                expect(teams.length).toBe(1);
                expect(teams[0]).toEqual(mockTeam);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/my');
            req.flush(mockTeam);
        });
    });

    describe('respondToInvitation', () => {
        it('should accept invitation when accept is true', () => {
            service.respondToInvitation(1, true).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/invitations/1/accept');
            expect(req.request.method).toBe('POST');
            req.flush(mockTeam);
        });

        it('should reject invitation when accept is false', () => {
            service.respondToInvitation(1, false).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/teams/invitations/1/reject');
            expect(req.request.method).toBe('POST');
            req.flush(null);
        });
    });
});
