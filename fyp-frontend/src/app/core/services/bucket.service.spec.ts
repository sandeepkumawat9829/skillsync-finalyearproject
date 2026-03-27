import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BucketService, ProjectBucket } from './bucket.service';

describe('BucketService', () => {
    let service: BucketService;
    let httpMock: HttpTestingController;

    const mockBucket: ProjectBucket = {
        bucketId: 1,
        title: 'AI/ML Projects',
        description: 'Machine Learning projects',
        department: 'Computer Science',
        technologies: ['Python', 'TensorFlow'],
        difficultyLevel: 'HARD',
        maxTeams: 5,
        allocatedTeams: 2,
        availableSlots: 3,
        isAvailable: true,
        postedById: 1,
        postedByName: 'Admin',
        postedAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BucketService]
        });
        service = TestBed.inject(BucketService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAvailableBuckets', () => {
        it('should fetch available buckets', () => {
            service.getAvailableBuckets().subscribe(buckets => {
                expect(buckets.length).toBe(1);
                expect(buckets[0].isAvailable).toBeTrue();
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets');
            expect(req.request.method).toBe('GET');
            req.flush([mockBucket]);
        });
    });

    describe('getAllBuckets', () => {
        it('should fetch all buckets', () => {
            service.getAllBuckets().subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/all');
            expect(req.request.method).toBe('GET');
            req.flush([mockBucket]);
        });
    });

    describe('getBucketsByDepartment', () => {
        it('should fetch buckets by department', () => {
            service.getBucketsByDepartment('Computer Science').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/department/Computer Science');
            expect(req.request.method).toBe('GET');
            req.flush([mockBucket]);
        });
    });

    describe('getBucketsByDifficulty', () => {
        it('should fetch buckets by difficulty', () => {
            service.getBucketsByDifficulty('HARD').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/difficulty/HARD');
            expect(req.request.method).toBe('GET');
            req.flush([mockBucket]);
        });
    });

    describe('getBucket', () => {
        it('should fetch single bucket by ID', () => {
            service.getBucket(1).subscribe(bucket => {
                expect(bucket).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockBucket);
        });
    });

    describe('createBucket', () => {
        it('should send POST request to create bucket', () => {
            service.createBucket(mockBucket, 1).subscribe(result => {
                expect(result).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets?userId=1');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockBucket);
            req.flush(mockBucket);
        });
    });

    describe('updateBucket', () => {
        it('should send PUT request to update bucket', () => {
            service.updateBucket(1, mockBucket).subscribe(result => {
                expect(result).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockBucket);
        });
    });

    describe('allocateTeam', () => {
        it('should send POST request to allocate team', () => {
            service.allocateTeam(1).subscribe(result => {
                expect(result).toEqual(mockBucket);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/1/allocate');
            expect(req.request.method).toBe('POST');
            req.flush(mockBucket);
        });
    });

    describe('deleteBucket', () => {
        it('should send DELETE request', () => {
            service.deleteBucket(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/buckets/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
