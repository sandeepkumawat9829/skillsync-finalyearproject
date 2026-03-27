import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, CreateTeamRequest, InviteMemberRequest } from '../models/project.model';
import { TeamInvitation, JoinRequest } from '../models/invitation.model';

@Injectable({
    providedIn: 'root'
})
export class TeamService {
    private apiUrl = 'https://outermost-leisha-noncoherently.ngrok-free.de/api/teams';

    constructor(private http: HttpClient) { }

    // Get team by project ID
    getTeamByProject(projectId: number): Observable<Team> {
        return this.http.get<Team>(`${this.apiUrl}/project/${projectId}`);
    }

    // Get teams by project ID (wrapper for list components)
    getTeamsByProject(projectId: number): Observable<Team[]> {
        return new Observable(observer => {
            this.getTeamByProject(projectId).subscribe({
                next: (team) => {
                    observer.next(team ? [team] : []);
                    observer.complete();
                },
                error: (err) => {
                    // Start: Mocking behavior if partial failure or 404 means no team
                    if (err.status === 404) {
                        observer.next([]);
                        observer.complete();
                    } else {
                        observer.error(err);
                    }
                }
            });
        });
    }

    // Get my team
    getMyTeam(): Observable<Team> {
        return this.http.get<Team>(`${this.apiUrl}/my`);
    }

    // Get team by ID
    getTeamById(teamId: number): Observable<Team> {
        return this.http.get<Team>(`${this.apiUrl}/${teamId}`);
    }

    // Get incomplete teams (for joining)
    getIncompleteTeams(): Observable<Team[]> {
        return this.http.get<Team[]>(`${this.apiUrl}/incomplete`);
    }

    // Send team invitation
    sendInvitation(teamId: number, request: InviteMemberRequest): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${teamId}/invite`, request);
    }

    // Get all my teams (student or mentor)
    getMyTeamsList(): Observable<Team[]> {
        return this.http.get<Team[]>(`${this.apiUrl}/mine`);
    }

    // Get my pending invitations
    getMyInvitations(): Observable<TeamInvitation[]> {
        return this.http.get<TeamInvitation[]>(`${this.apiUrl}/invitations`);
    }

    // Accept invitation
    acceptInvitation(invitationId: number): Observable<Team> {
        return this.http.post<Team>(`${this.apiUrl}/invitations/${invitationId}/accept`, {});
    }

    // Get legacy array of teams (now forwards to actual plural endpoint)
    getMyTeams(): Observable<Team[]> {
        return this.getMyTeamsList();
    }

    createTeam(teamData: any): Observable<Team> {
        return this.http.post<Team>(`${this.apiUrl}`, teamData);
    }

    removeMember(teamId: number, memberId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${memberId}`);
    }

    deleteTeam(teamId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${teamId}`);
    }

    // Convenience method for respond
    respondToInvitation(invitationId: number, accept: boolean): Observable<void> {
        if (accept) {
            // acceptInvitation returns Observable<Team>, map to void
            return new Observable(observer => {
                this.acceptInvitation(invitationId).subscribe({
                    next: () => { observer.next(); observer.complete(); },
                    error: (e) => observer.error(e)
                });
            });
        } else {
            return this.rejectInvitation(invitationId);
        }
    }

    // Reject invitation
    rejectInvitation(invitationId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/invitations/${invitationId}/reject`, {});
    }

    // Request to join a team
    requestToJoin(teamId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${teamId}/request-join`, {});
    }

    // Get join requests for a team (team leader only)
    getJoinRequests(teamId: number): Observable<JoinRequest[]> {
        return this.http.get<JoinRequest[]>(`${this.apiUrl}/${teamId}/join-requests`);
    }

    // Get my sent join requests (pending)
    getMySentJoinRequests(): Observable<JoinRequest[]> {
        return this.http.get<JoinRequest[]>(`${this.apiUrl}/join-requests/sent`);
    }

    // Accept a join request (team leader only)
    acceptJoinRequest(requestId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/join-requests/${requestId}/accept`, {});
    }

    // Reject a join request (team leader only)
    rejectJoinRequest(requestId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/join-requests/${requestId}/reject`, {});
    }
}
