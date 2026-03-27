import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserManagementComponent } from './user-management.component';
import { AdminService } from '../../../core/services/admin.service';

describe('UserManagementComponent', () => {
    let component: UserManagementComponent;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockUsers = [
        {
            userId: 1,
            email: 'student@example.com',
            role: 'STUDENT',
            isActive: true,
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', [
            'getAllUsers', 'activateUser', 'deactivateUser', 'deleteUser'
        ]);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        adminServiceSpy.getAllUsers.and.returnValue(of(mockUsers));
        adminServiceSpy.activateUser.and.returnValue(of({ message: 'Activated' }));
        adminServiceSpy.deactivateUser.and.returnValue(of({ message: 'Deactivated' }));
        adminServiceSpy.deleteUser.and.returnValue(of(void 0));

        component = new UserManagementComponent(adminServiceSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load users on init', () => {
            component.ngOnInit();
            expect(adminServiceSpy.getAllUsers).toHaveBeenCalled();
        });

        it('should populate users array', () => {
            component.ngOnInit();
            expect(component.users.length).toBe(1);
        });
    });

    describe('Filtering', () => {
        beforeEach(() => {
            component.users = mockUsers;
            component.allUsers = mockUsers;
        });

        it('should filter by role', () => {
            component.selectedRole = 'STUDENT';
            component.applyFilters();
            expect(component.filteredUsers.every(u => u.role === 'STUDENT')).toBeTrue();
        });
    });

    describe('getRoleClass', () => {
        it('should return student for STUDENT', () => {
            expect(component.getRoleClass('STUDENT')).toBe('student');
        });

        it('should return mentor for MENTOR', () => {
            expect(component.getRoleClass('MENTOR')).toBe('mentor');
        });

        it('should return admin for ADMIN', () => {
            expect(component.getRoleClass('ADMIN')).toBe('admin');
        });
    });
});
