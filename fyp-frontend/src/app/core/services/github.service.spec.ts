import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GitHubService, GitHubCommit, GitHubStats, SyncResult } from './github.service';

describe('GitHubService', () => {
    let service: GitHubService;
    let httpMock: HttpTestingController;

    const mockCommit: GitHubCommit = {
        commitId: 1,
        projectId: 1,
        commitHash: 'abc123',
        commitMessage: 'Initial commit',
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        committedAt: new Date(),
        linesAdded: 100,
        linesDeleted: 20,
        filesChanged: 5,
        syncedAt: new Date()
    };

    const mockStats: GitHubStats = {
        totalCommits: 50,
        totalLinesAdded: 5000,
        totalLinesDeleted: 1000,
        netLinesOfCode: 4000,
        topContributors: [
            { authorEmail: 'john@example.com', authorName: 'John', commitCount: 30, percentage: 60 }
        ],
        recentCommits: [mockCommit],
        repositoryUrl: 'https://github.com/user/repo',
        lastSyncedAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [GitHubService]
        });
        service = TestBed.inject(GitHubService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('syncCommits', () => {
        it('should send POST request to sync commits', () => {
            const syncResult: SyncResult = {
                success: true,
                newCommitsCount: 5,
                message: 'Synced 5 new commits'
            };

            service.syncCommits(1).subscribe(result => {
                expect(result).toEqual(syncResult);
                expect(result.success).toBeTrue();
            });

            const req = httpMock.expectOne('/api/github/projects/1/sync');
            expect(req.request.method).toBe('POST');
            req.flush(syncResult);
        });
    });

    describe('getStats', () => {
        it('should fetch GitHub stats for project', () => {
            service.getStats(1).subscribe(stats => {
                expect(stats).toEqual(mockStats);
                expect(stats.totalCommits).toBe(50);
            });

            const req = httpMock.expectOne('/api/github/projects/1/stats');
            expect(req.request.method).toBe('GET');
            req.flush(mockStats);
        });
    });

    describe('getCommits', () => {
        it('should fetch commits with default pagination', () => {
            service.getCommits(1).subscribe(commits => {
                expect(commits.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/github/projects/1/commits?page=0&size=20');
            expect(req.request.method).toBe('GET');
            req.flush([mockCommit]);
        });

        it('should fetch commits with custom pagination', () => {
            service.getCommits(1, 2, 50).subscribe();

            const req = httpMock.expectOne('/api/github/projects/1/commits?page=2&size=50');
            expect(req.request.method).toBe('GET');
            req.flush([mockCommit]);
        });
    });
});
