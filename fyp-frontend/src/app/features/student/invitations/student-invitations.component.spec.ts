import { of } from 'rxjs';
import { Router } from '@angular/router';
import { StudentInvitationsComponent } from './student-invitations.component';
import { InvitationService } from '../../../core/services/invitation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('StudentInvitationsComponent', () => {
    let component: StudentInvitationsComponent;
    let invitationServiceSpy: jasmine.SpyObj<InvitationService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockInvitations = [
        {
            invitationId: 1,
            teamId: 1,
            teamName: 'Team Alpha',
            projectTitle: 'AI Project',
            invitedBy: 1,
            invitedByName: 'John',
            status: 'PENDING',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        invitationServiceSpy = jasmine.createSpyObj('InvitationService', [
            'getMyInvitations', 'acceptInvitation', 'rejectInvitation'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        invitationServiceSpy.getMyInvitations.and.returnValue(of(mockInvitations));
        invitationServiceSpy.acceptInvitation.and.returnValue(of({ message: 'Accepted' }));
        invitationServiceSpy.rejectInvitation.and.returnValue(of({ message: 'Rejected' }));

        component = new StudentInvitationsComponent(invitationServiceSpy, routerSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load invitations on init', () => {
            component.ngOnInit();
            expect(invitationServiceSpy.getMyInvitations).toHaveBeenCalled();
        });

        it('should populate invitations array', () => {
            component.ngOnInit();
            expect(component.invitations.length).toBe(1);
        });
    });

    describe('acceptInvitation', () => {
        it('should call acceptInvitation service', () => {
            component.acceptInvitation(1);
            expect(invitationServiceSpy.acceptInvitation).toHaveBeenCalledWith(1);
        });
    });

    describe('rejectInvitation', () => {
        it('should call rejectInvitation service', () => {
            component.rejectInvitation(1);
            expect(invitationServiceSpy.rejectInvitation).toHaveBeenCalledWith(1);
        });
    });
});
