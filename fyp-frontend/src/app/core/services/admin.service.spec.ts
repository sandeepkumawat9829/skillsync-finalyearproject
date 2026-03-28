import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService, TeamWithoutMentor, ForceAssignResponse } from './admin.service';
import { SystemAnalytics, UserManagement, CollegeBucket, CreateBucketRequest } from '../models/admin.model';

describe('AdminService', () => {
    let service: AdminService;
    let httpMock: HttpTestingController;

    const mockAnalytics: SystemAnalytics = {
        totalUsers: 150,
        totalStudents: 100,
        totalMentors: 20,
        totalProjects: 50,
        activeTeams: 45,
        completedProjects: 15,
        usersByRole: [
            { role: 'STUDENT', count: 100 },
            { role: 'MENTOR', count: 20 }
        ],
        projectsByStatus: [
            { status: 'IN_PROGRESS', count: 30 },
            { status: 'COMPLETED', count: 15 }
        ],
        registrationTrend: [],
        projectCreationTrend: []
    };

    const mockUser: UserManagement = {
        userId: 1,
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'STUDENT',
        isActive: true,
        createdAt: new Date()
    };

    const mockBucket: CollegeBucket = {
        bucketId: 1,
        title: 'AI/ML Projects',
        description: 'Machine Learning projects',
        department: 'Computer Science',
        difficulty: 'HARD',
        technologies: ['Python', 'TensorFlow'],
        maxTeams: 5,
        allocatedTeams: 2,
        isAvailable: true,
        postedBy: 1,
        postedByName: 'Admin User',
        postedAt: new Date(),
        deadline: new Date()
    };

    const mockTeamWithoutMentor: TeamWithoutMentor = {
        teamId: 1,
        teamName: 'Team Alpha',
        projectId: 1,
        projectTitle: 'AI Project',
        teamLeaderId: 1,
        teamLeaderName: 'John Doe',
        currentMemberCount: 3,
        maxMembers: 4,
        isComplete: false,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AdminService]
        });
        service = TestBed.inject(AdminService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getSystemAnalytics', () => {
        it('should fetch system analytics from dashboard endpoint', () => {
            service.getSystemAnalytics().subscribe(analytics => {
                expect(analytics).toEqual(mockAnalytics);
                expect(analytics.totalStudents).toBe(100);
            });

            const req = httpMock.expectOne('/api/admin/dashboard');
            expect(req.request.method).toBe('GET');
            req.flush(mockAnalytics);
        });
    });

    describe('getUsers', () => {
        it('should fetch all users without role filter', () => {
            const users: UserManagement[] = [mockUser];

            service.getUsers().subscribe(result => {
                expect(result).toEqual(users);
            });

            const req = httpMock.expectOne('/api/admin/users');
            expect(req.request.method).toBe('GET');
            req.flush(users);
        });

        it('should fetch users filtered by role', () => {
            const users: UserManagement[] = [mockUser];

            service.getUsers('STUDENT').subscribe(result => {
                expect(result).toEqual(users);
            });

            const req = httpMock.expectOne('/api/admin/users?role=STUDENT');
            expect(req.request.method).toBe('GET');
            req.flush(users);
        });

        it('should fetch mentors when role is MENTOR', () => {
            const mentors: UserManagement[] = [{ ...mockUser, role: 'MENTOR' }];

            service.getUsers('MENTOR').subscribe(result => {
                expect(result).toEqual(mentors);
            });

            const req = httpMock.expectOne('/api/admin/users?role=MENTOR');
            req.flush(mentors);
        });
    });

    describe('toggleUserStatus', () => {
        it('should send PUT request to toggle user status', () => {
            const toggledUser = { ...mockUser, isActive: false };

            service.toggleUserStatus(1).subscribe(result => {
                expect(result.isActive).toBeFalse();
            });

            const req = httpMock.expectOne('/api/admin/users/1/toggle-status');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({});
            req.flush(toggledUser);
        });
    });

    describe('enableUser', () => {
        it('should send PUT request to enable user', () => {
            service.enableUser(1).subscribe();

            const req = httpMock.expectOne('/api/admin/users/1/enable');
            expect(req.request.method).toBe('PUT');
            req.flush(null);
        });
    });

    describe('disableUser', () => {
        it('should send PUT request to disable user', () => {
            service.disableUser(1).subscribe();

            const req = httpMock.expectOne('/api/admin/users/1/disable');
            expect(req.request.method).toBe('PUT');
            req.flush(null);
        });
    });

    describe('getProjectBuckets', () => {
        it('should fetch project buckets', () => {
            const buckets: CollegeBucket[] = [mockBucket];

            service.getProjectBuckets().subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0].title).toBe('AI/ML Projects');
            });

            const req = httpMock.expectOne('/api/admin/buckets');
            expect(req.request.method).toBe('GET');
            req.flush(buckets);
        });
    });

    describe('createBucket', () => {
        it('should send POST request to create bucket', () => {
            const newBucket: CreateBucketRequest = {
                title: 'New Bucket',
                description: 'Test Description',
                department: 'Computer Science',
                difficulty: 'MEDIUM',
                technologies: ['Angular'],
                maxTeams: 3,
                deadline: new Date()
            };

            service.createBucket(newBucket).subscribe(result => {
                expect(result).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('/api/admin/buckets');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newBucket);
            req.flush(mockBucket);
        });
    });

    describe('updateBucket', () => {
        it('should send PUT request to update bucket', () => {
            const updates: Partial<CollegeBucket> = { title: 'Updated Title' };

            service.updateBucket(1, updates).subscribe(result => {
                expect(result).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('/api/admin/buckets/1');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updates);
            req.flush(mockBucket);
        });
    });

    describe('deleteBucket', () => {
        it('should send DELETE request', () => {
            service.deleteBucket(1).subscribe();

            const req = httpMock.expectOne('/api/admin/buckets/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getTeamsWithoutMentor', () => {
        it('should fetch teams without assigned mentor', () => {
            const teams: TeamWithoutMentor[] = [mockTeamWithoutMentor];

            service.getTeamsWithoutMentor().subscribe(result => {
                expect(result.length).toBe(1);
                expect(result[0].teamName).toBe('Team Alpha');
            });

            const req = httpMock.expectOne('/api/admin/teams/without-mentor');
            expect(req.request.method).toBe('GET');
            req.flush(teams);
        });
    });

    describe('forceAssignMentor', () => {
        it('should send POST request to assign mentor', () => {
            const response: ForceAssignResponse = {
                message: 'Mentor assigned successfully',
                assignmentId: 1,
                teamId: 1,
                mentorId: 5
            };

            service.forceAssignMentor(1, 5).subscribe(result => {
                expect(result).toEqual(response);
                expect(result.mentorId).toBe(5);
            });

            const req = httpMock.expectOne('/api/admin/teams/1/assign-mentor');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ mentorId: 5 });
            req.flush(response);
        });
    });
});
