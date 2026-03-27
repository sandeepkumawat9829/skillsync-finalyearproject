import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PeerReviewService, PeerReview, PeerReviewSummary } from './peer-review.service';

describe('PeerReviewService', () => {
    let service: PeerReviewService;
    let httpMock: HttpTestingController;

    const mockReview: PeerReview = {
        reviewId: 1,
        projectId: 1,
        reviewerId: 1,
        reviewerName: 'John Doe',
        revieweeId: 2,
        revieweeName: 'Jane Smith',
        technicalSkillsRating: 4,
        communicationRating: 5,
        teamworkRating: 4,
        problemSolvingRating: 4,
        overallContributionRating: 4,
        anonymousFeedback: 'Great team player',
        isAnonymous: true,
        createdAt: new Date()
    };

    const mockSummary: PeerReviewSummary = {
        userId: 1,
        userName: 'John Doe',
        averageTechnicalSkills: 4.2,
        averageCommunication: 4.5,
        averageTeamwork: 4.0,
        averageProblemSolving: 3.8,
        averageOverall: 4.1,
        totalReviewsReceived: 5
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PeerReviewService]
        });
        service = TestBed.inject(PeerReviewService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('submitReview', () => {
        it('should send POST request to submit review', () => {
            service.submitReview(mockReview).subscribe(result => {
                expect(result).toEqual(mockReview);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/peer-reviews');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockReview);
            req.flush(mockReview);
        });
    });

    describe('getMyFeedback', () => {
        it('should fetch feedback received for a project', () => {
            service.getMyFeedback(1).subscribe(reviews => {
                expect(reviews.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/peer-reviews/projects/1/my-feedback');
            expect(req.request.method).toBe('GET');
            req.flush([mockReview]);
        });
    });

    describe('getMySubmittedReviews', () => {
        it('should fetch reviews submitted by current user', () => {
            service.getMySubmittedReviews().subscribe(reviews => {
                expect(reviews.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/peer-reviews/my-reviews');
            expect(req.request.method).toBe('GET');
            req.flush([mockReview]);
        });
    });

    describe('getMySummary', () => {
        it('should fetch current user review summary', () => {
            service.getMySummary().subscribe(summary => {
                expect(summary).toEqual(mockSummary);
                expect(summary.totalReviewsReceived).toBe(5);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/peer-reviews/my-summary');
            expect(req.request.method).toBe('GET');
            req.flush(mockSummary);
        });
    });

    describe('getUserSummary', () => {
        it('should fetch user summary by ID (for mentors)', () => {
            service.getUserSummary(1).subscribe(summary => {
                expect(summary).toEqual(mockSummary);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/peer-reviews/users/1/summary');
            expect(req.request.method).toBe('GET');
            req.flush(mockSummary);
        });
    });
});
