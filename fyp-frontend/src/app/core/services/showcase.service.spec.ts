import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ShowcaseService, ProjectShowcase, PublishRequest } from './showcase.service';

describe('ShowcaseService', () => {
    let service: ShowcaseService;
    let httpMock: HttpTestingController;

    const mockShowcase: ProjectShowcase = {
        showcaseId: 1,
        projectId: 1,
        projectTitle: 'AI Chatbot',
        projectAbstract: 'An AI-powered chatbot',
        teamName: 'Team Alpha',
        teamMembers: ['John Doe', 'Jane Smith'],
        mentorName: 'Dr. Smith',
        isPublished: true,
        academicYear: '2025-26',
        technologies: ['Python', 'TensorFlow'],
        tags: ['AI', 'ML'],
        awards: ['Best Project'],
        viewsCount: 150,
        likesCount: 25,
        hasLiked: false,
        publishedAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ShowcaseService]
        });
        service = TestBed.inject(ShowcaseService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getGallery', () => {
        it('should fetch gallery with default parameters', () => {
            service.getGallery().subscribe(showcases => {
                expect(showcases.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase?page=0&size=12&sortBy=recent');
            expect(req.request.method).toBe('GET');
            req.flush([mockShowcase]);
        });

        it('should fetch gallery with custom parameters', () => {
            service.getGallery(1, 20, 'popular').subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/showcase?page=1&size=20&sortBy=popular');
            expect(req.request.method).toBe('GET');
            req.flush([mockShowcase]);
        });
    });

    describe('getShowcase', () => {
        it('should fetch single showcase by ID', () => {
            service.getShowcase(1).subscribe(showcase => {
                expect(showcase).toEqual(mockShowcase);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockShowcase);
        });
    });

    describe('publishProject', () => {
        it('should send POST request to publish project', () => {
            const request: PublishRequest = {
                academicYear: '2025-26',
                githubUrl: 'https://github.com/project',
                tags: ['AI', 'ML']
            };

            service.publishProject(1, request).subscribe(result => {
                expect(result).toEqual(mockShowcase);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/projects/1/publish');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(request);
            req.flush(mockShowcase);
        });
    });

    describe('toggleLike', () => {
        it('should send POST request to toggle like', () => {
            service.toggleLike(1).subscribe(result => {
                expect(result.liked).toBeTrue();
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/1/like');
            expect(req.request.method).toBe('POST');
            req.flush({ liked: true });
        });

        it('should return liked: false when unliking', () => {
            service.toggleLike(1).subscribe(result => {
                expect(result.liked).toBeFalse();
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/1/like');
            req.flush({ liked: false });
        });
    });

    describe('search', () => {
        it('should search showcases with default parameters', () => {
            service.search('AI').subscribe(showcases => {
                expect(showcases.length).toBe(1);
            });

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/search?q=AI&page=0&size=12');
            expect(req.request.method).toBe('GET');
            req.flush([mockShowcase]);
        });

        it('should search showcases with custom pagination', () => {
            service.search('ML', 2, 24).subscribe();

            const req = httpMock.expectOne('http://localhost:8080/api/showcase/search?q=ML&page=2&size=24');
            expect(req.request.method).toBe('GET');
            req.flush([mockShowcase]);
        });
    });
});
