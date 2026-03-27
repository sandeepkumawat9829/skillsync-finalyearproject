import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, DashboardData } from './user.service';
import { StudentProfile } from '../models/user.model';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    const mockProfile: StudentProfile = {
        profileId: 1,
        userId: 1,
        email: 'student@example.com',
        fullName: 'John Doe',
        enrollmentNumber: 'ENR001',
        branch: 'Computer Science',
        currentSemester: 6,
        cgpa: 8.5,
        skills: ['Angular', 'Java']
    } as StudentProfile;

    const mockDashboard: DashboardData = {
        profile: mockProfile,
        projectCount: 2,
        teamCount: 1,
        pendingInvitations: 3,
        tasksDue: 5,
        upcomingMeetings: [],
        recentNotifications: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getMyProfile', () => {
        it('should fetch current user profile', () => {
            service.getMyProfile().subscribe(profile => {
                expect(profile).toEqual(mockProfile);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/users/profile');
            expect(req.request.method).toBe('GET');
            req.flush(mockProfile);
        });
    });

    describe('updateMyProfile', () => {
        it('should send PUT request to update profile', () => {
            const updates = { fullName: 'Updated Name' };

            service.updateMyProfile(updates).subscribe(result => {
                expect(result).toEqual(mockProfile);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/users/profile');
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updates);
            req.flush(mockProfile);
        });
    });

    describe('getDashboard', () => {
        it('should fetch dashboard data', () => {
            service.getDashboard().subscribe(data => {
                expect(data).toEqual(mockDashboard);
                expect(data.tasksDue).toBe(5);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/users/dashboard');
            expect(req.request.method).toBe('GET');
            req.flush(mockDashboard);
        });
    });

    describe('searchStudents', () => {
        it('should search students by query', () => {
            service.searchStudents('John').subscribe(students => {
                expect(students.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/users/students/search?q=John');
            expect(req.request.method).toBe('GET');
            req.flush([mockProfile]);
        });

        it('should include branch filter when provided', () => {
            service.searchStudents('John', 'Computer Science').subscribe();

            const req = httpMock.expectOne(
                'http://localhost:8080/api/users/students/search?q=John&branch=Computer%20Science'
            );
            expect(req.request.method).toBe('GET');
            req.flush([mockProfile]);
        });

        it('should include semester filter when provided', () => {
            service.searchStudents('John', undefined, 6).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/users/students/search?q=John&semester=6');
            expect(req.request.method).toBe('GET');
            req.flush([mockProfile]);
        });

        it('should include both filters when provided', () => {
            service.searchStudents('John', 'CS', 6).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/users/students/search?q=John&branch=CS&semester=6');
            expect(req.request.method).toBe('GET');
            req.flush([mockProfile]);
        });

        it('should encode special characters in query', () => {
            service.searchStudents('John & Jane').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/users/students/search?q=John%20%26%20Jane');
            req.flush([]);
        });
    });

    describe('getStudentById', () => {
        it('should fetch student by ID', () => {
            service.getStudentById(1).subscribe(student => {
                expect(student).toEqual(mockProfile);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/users/students/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockProfile);
        });
    });
});
