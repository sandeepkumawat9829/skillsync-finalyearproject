import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResourceService, SharedResource } from './resource.service';

describe('ResourceService', () => {
    let service: ResourceService;
    let httpMock: HttpTestingController;

    const mockResource: SharedResource = {
        resourceId: 1,
        sharedById: 1,
        sharedByName: 'John Doe',
        teamId: 1,
        resourceTitle: 'Angular Best Practices',
        resourceType: 'TUTORIAL',
        resourceUrl: 'https://example.com/angular-tutorial',
        description: 'Great tutorial for Angular',
        projectPhase: 'DEVELOPMENT',
        createdAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ResourceService]
        });
        service = TestBed.inject(ResourceService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createResource', () => {
        it('should send POST request to create resource', () => {
            service.createResource(mockResource).subscribe(result => {
                expect(result).toEqual(mockResource);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockResource);
            req.flush(mockResource);
        });
    });

    describe('getTeamResources', () => {
        it('should fetch team resources without filters', () => {
            service.getTeamResources(1).subscribe(resources => {
                expect(resources.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources/teams/1');
            expect(req.request.method).toBe('GET');
            req.flush([mockResource]);
        });

        it('should fetch team resources with type filter', () => {
            service.getTeamResources(1, 'TUTORIAL').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources/teams/1?type=TUTORIAL');
            expect(req.request.method).toBe('GET');
            req.flush([mockResource]);
        });

        it('should fetch team resources with phase filter', () => {
            service.getTeamResources(1, undefined, 'DEVELOPMENT').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources/teams/1?phase=DEVELOPMENT');
            expect(req.request.method).toBe('GET');
            req.flush([mockResource]);
        });

        it('should fetch team resources with both filters', () => {
            service.getTeamResources(1, 'TUTORIAL', 'DEVELOPMENT').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources/teams/1?type=TUTORIAL&phase=DEVELOPMENT');
            expect(req.request.method).toBe('GET');
            req.flush([mockResource]);
        });
    });

    describe('deleteResource', () => {
        it('should send DELETE request', () => {
            service.deleteResource(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/resources/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
