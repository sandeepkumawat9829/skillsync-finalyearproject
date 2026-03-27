import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IssueListComponent } from './issue-list.component';
import { IssueService } from '../../../core/services/issue.service';

describe('IssueListComponent', () => {
    let component: IssueListComponent;
    let issueServiceSpy: jasmine.SpyObj<IssueService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockIssues = [
        {
            issueId: 1,
            projectId: 1,
            title: 'Bug in login',
            description: 'Login fails',
            status: 'OPEN',
            priority: 'HIGH',
            createdBy: 1,
            createdByName: 'John',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        issueServiceSpy = jasmine.createSpyObj('IssueService', ['getIssuesByProject']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        issueServiceSpy.getIssuesByProject.and.returnValue(of(mockIssues));

        component = new IssueListComponent(issueServiceSpy, routerSpy, snackBarSpy);
        component.projectId = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load issues on init', () => {
            component.ngOnInit();
            expect(issueServiceSpy.getIssuesByProject).toHaveBeenCalledWith(1);
        });

        it('should populate issues array', () => {
            component.ngOnInit();
            expect(component.issues.length).toBe(1);
        });
    });

    describe('Filtering', () => {
        beforeEach(() => {
            component.issues = mockIssues;
            component.allIssues = mockIssues;
        });

        it('should filter by status', () => {
            component.selectedStatus = 'OPEN';
            component.applyFilters();
            expect(component.filteredIssues.every(i => i.status === 'OPEN')).toBeTrue();
        });
    });

    describe('getPriorityColor', () => {
        it('should return red for HIGH', () => {
            expect(component.getPriorityColor('HIGH')).toBe('red');
        });

        it('should return gray for LOW', () => {
            expect(component.getPriorityColor('LOW')).toBe('gray');
        });
    });

    describe('getStatusClass', () => {
        it('should return open for OPEN status', () => {
            expect(component.getStatusClass('OPEN')).toBe('open');
        });

        it('should return closed for CLOSED status', () => {
            expect(component.getStatusClass('CLOSED')).toBe('closed');
        });
    });
});
