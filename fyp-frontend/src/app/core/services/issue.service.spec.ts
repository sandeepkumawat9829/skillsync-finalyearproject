import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IssueService } from './issue.service';
import { Issue, IssueComment, CreateIssueRequest, UpdateIssueRequest } from '../models/issue.model';

describe('IssueService', () => {
    let service: IssueService;
    let httpMock: HttpTestingController;

    const mockIssue: Issue = {
        issueId: 1,
        projectId: 1,
        title: 'Bug: Login not working',
        description: 'Users cannot login',
        status: 'OPEN',
        priority: 'HIGH',
        reportedBy: 1,
        reportedByName: 'John Doe',
        assignedTo: 2,
        assignedToName: 'Jane Smith',
        createdAt: new Date()
    } as Issue;

    const mockComment: IssueComment = {
        commentId: 1,
        issueId: 1,
        userId: 1,
        userName: 'John Doe',
        commentText: 'Working on this',
        createdAt: new Date()
    } as IssueComment;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [IssueService]
        });
        service = TestBed.inject(IssueService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getIssuesByProject', () => {
        it('should fetch issues by project ID', () => {
            service.getIssuesByProject(1).subscribe(issues => {
                expect(issues.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/project/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockIssue]);
        });
    });

    describe('getIssueById', () => {
        it('should fetch issue by ID', () => {
            service.getIssueById(1).subscribe(issue => {
                expect(issue).toEqual(mockIssue);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockIssue);
        });
    });

    describe('createIssue', () => {
        it('should send POST request to create issue', () => {
            const request: CreateIssueRequest = {
                projectId: 1,
                title: 'New Issue',
                description: 'Description',
                priority: 'MEDIUM'
            } as CreateIssueRequest;

            service.createIssue(request).subscribe(result => {
                expect(result).toEqual(mockIssue);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues');
            expect(req.request.method).toBe('POST');
            req.flush(mockIssue);
        });
    });

    describe('updateIssue', () => {
        it('should send PUT request to update issue', () => {
            const updates: UpdateIssueRequest = {
                status: 'IN_PROGRESS'
            } as UpdateIssueRequest;

            service.updateIssue(1, updates).subscribe(result => {
                expect(result).toEqual(mockIssue);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockIssue);
        });
    });

    describe('assignIssue', () => {
        it('should send PUT request to assign issue', () => {
            service.assignIssue(1, 5).subscribe(result => {
                expect(result).toEqual(mockIssue);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1/assign');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ userId: 5 });
            req.flush(mockIssue);
        });
    });

    describe('linkTask', () => {
        it('should send POST request to link issue to task', () => {
            service.linkTask(1, 10).subscribe(result => {
                expect(result).toEqual(mockIssue);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1/link-task/10');
            expect(req.request.method).toBe('POST');
            req.flush(mockIssue);
        });
    });

    describe('addComment', () => {
        it('should send POST request to add comment', () => {
            service.addComment(1, 'This is a comment').subscribe(result => {
                expect(result).toEqual(mockComment);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1/comments');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ commentText: 'This is a comment' });
            req.flush(mockComment);
        });
    });

    describe('getComments', () => {
        it('should fetch comments for issue', () => {
            service.getComments(1).subscribe(comments => {
                expect(comments.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1/comments');
            expect(req.request.method).toBe('GET');
            req.flush([mockComment]);
        });
    });

    describe('deleteIssue', () => {
        it('should send DELETE request', () => {
            service.deleteIssue(1).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/issues/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
