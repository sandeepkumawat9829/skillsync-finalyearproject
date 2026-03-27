import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorAssignmentComponent } from './mentor-assignment.component';
import { AdminService } from '../../../core/services/admin.service';

describe('MentorAssignmentComponent', () => {
    let component: MentorAssignmentComponent;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockMentors = [
        { userId: 1, email: 'mentor@example.com', fullName: 'Dr. Smith', assignedTeams: 3 }
    ];

    const mockTeams = [
        { teamId: 1, teamName: 'Team Alpha', projectTitle: 'AI Project', hasMentor: false }
    ];

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', [
            'getMentors', 'getUnassignedTeams', 'assignMentor'
        ]);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        adminServiceSpy.getMentors.and.returnValue(of(mockMentors));
        adminServiceSpy.getUnassignedTeams.and.returnValue(of(mockTeams));
        adminServiceSpy.assignMentor.and.returnValue(of({ message: 'Assigned' }));

        component = new MentorAssignmentComponent(adminServiceSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load mentors on init', () => {
            component.ngOnInit();
            expect(adminServiceSpy.getMentors).toHaveBeenCalled();
        });

        it('should load unassigned teams on init', () => {
            component.ngOnInit();
            expect(adminServiceSpy.getUnassignedTeams).toHaveBeenCalled();
        });
    });

    describe('assignMentor', () => {
        it('should call assignMentor service', () => {
            component.assignMentor(1, 1);
            expect(adminServiceSpy.assignMentor).toHaveBeenCalledWith(1, 1);
        });
    });
});
