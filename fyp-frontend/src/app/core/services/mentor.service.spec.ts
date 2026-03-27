import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MentorService } from './mentor.service';
import { Mentor, MentorRequest } from '../models/mentor.model';

describe('MentorService', () => {
    let service: MentorService;
    let httpMock: HttpTestingController;

    const mockMentor: Mentor = {
        mentorId: 1,
        userId: 1,
        fullName: 'Dr. Smith',
        email: 'smith@university.edu',
        department: 'Computer Science',
        designation: 'Associate Professor',
        expertise: ['AI', 'Machine Learning'],
        bio: 'Expert in AI research',
        experience: 10,
        maxStudents: 5,
        currentStudents: 2,
        isAvailable: true
    };

    const mockMentorRequest: MentorRequest = {
        requestId: 1,
        teamId: 1,
        teamName: 'Team Alpha',
        projectId: 1,
        projectTitle: 'AI Project',
        projectAbstract: 'An AI project',
        projectDomain: 'AI',
        teamLeaderId: 1,
        teamLeaderName: 'John Doe',
        teamMembers: [],
        message: 'Please mentor us',
        status: 'PENDING',
        requestedAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MentorService]
        });
        service = TestBed.inject(MentorService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllMentors', () => {
        it('should fetch all mentors', () => {
            service.getAllMentors().subscribe(mentors => {
                expect(mentors.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors');
            expect(req.request.method).toBe('GET');
            req.flush([mockMentor]);
        });
    });

    describe('getAvailableMentors', () => {
        it('should fetch available mentors', () => {
            service.getAvailableMentors().subscribe(mentors => {
                expect(mentors[0].isAvailable).toBeTrue();
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/available');
            expect(req.request.method).toBe('GET');
            req.flush([mockMentor]);
        });
    });

    describe('getMentorById', () => {
        it('should fetch mentor by ID', () => {
            service.getMentorById(1).subscribe(mentor => {
                expect(mentor).toEqual(mockMentor);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockMentor);
        });
    });

    describe('searchMentors', () => {
        it('should search mentors by query', () => {
            service.searchMentors('AI').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/search?q=AI');
            expect(req.request.method).toBe('GET');
            req.flush([mockMentor]);
        });

        it('should encode special characters in search query', () => {
            service.searchMentors('AI & ML').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/search?q=AI%20%26%20ML');
            req.flush([mockMentor]);
        });
    });

    describe('sendMentorRequest', () => {
        it('should send POST request to request mentor', () => {
            const request = { teamId: 1, mentorId: 1, message: 'Please mentor us' };

            service.sendMentorRequest(request).subscribe(result => {
                expect(result).toEqual(mockMentorRequest);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/request');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(request);
            req.flush(mockMentorRequest);
        });
    });

    describe('getMyRequests', () => {
        it('should fetch student mentor requests', () => {
            service.getMyRequests().subscribe(requests => {
                expect(requests.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/requests/my');
            expect(req.request.method).toBe('GET');
            req.flush([mockMentorRequest]);
        });
    });

    describe('cancelRequest', () => {
        it('should send DELETE request to cancel mentor request', () => {
            service.cancelRequest(1).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/requests/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    describe('getMentorStats', () => {
        it('should fetch mentor statistics', () => {
            const stats = { pendingRequests: 5, assignedTeams: 3, upcomingMeetings: 2, totalProjects: 10 };

            service.getMentorStats(1).subscribe(result => {
                expect(result).toEqual(stats);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/1/stats');
            expect(req.request.method).toBe('GET');
            req.flush(stats);
        });
    });

    describe('getPendingMentorRequests', () => {
        it('should fetch pending requests for mentor', () => {
            service.getPendingMentorRequests(1).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/requests/pending');
            expect(req.request.method).toBe('GET');
            req.flush([mockMentorRequest]);
        });
    });

    describe('acceptMentorRequest', () => {
        it('should send POST request to accept mentor request', () => {
            service.acceptMentorRequest(1, 'Looking forward to working with you').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/requests/1/accept');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ feedback: 'Looking forward to working with you' });
            req.flush(null);
        });
    });

    describe('rejectMentorRequest', () => {
        it('should send POST request to reject mentor request', () => {
            service.rejectMentorRequest(1, 'Already at capacity').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/requests/1/reject');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ reason: 'Already at capacity' });
            req.flush(null);
        });
    });

    describe('getAssignedTeams', () => {
        it('should fetch assigned teams for mentor', () => {
            service.getAssignedTeams(1).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/1/teams');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });

    describe('getMyAssignments', () => {
        it('should fetch mentor assignments for current mentor', () => {
            service.getMyAssignments().subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/mentors/assignments');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });
});
