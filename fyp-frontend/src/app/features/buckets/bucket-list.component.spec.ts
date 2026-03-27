import { of, throwError } from 'rxjs';
import { BucketListComponent } from './bucket-list.component';
import { BucketService, ProjectBucket } from '../../core/services/bucket.service';

describe('BucketListComponent', () => {
    let component: BucketListComponent;
    let bucketServiceSpy: jasmine.SpyObj<BucketService>;

    const mockBuckets: ProjectBucket[] = [
        {
            bucketId: 1,
            title: 'AI Project',
            description: 'Build an AI system',
            difficultyLevel: 'MEDIUM',
            technologies: ['Python', 'TensorFlow'],
            maxTeams: 5,
            availableSlots: 3,
            isActive: true,
            createdAt: new Date()
        },
        {
            bucketId: 2,
            title: 'Web App',
            description: 'Build a web app',
            difficultyLevel: 'EASY',
            technologies: ['Angular'],
            maxTeams: 10,
            availableSlots: 5,
            isActive: true,
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        bucketServiceSpy = jasmine.createSpyObj('BucketService', ['getAvailableBuckets', 'getBucketsByDifficulty']);
        bucketServiceSpy.getAvailableBuckets.and.returnValue(of(mockBuckets));
        bucketServiceSpy.getBucketsByDifficulty.and.returnValue(of([mockBuckets[0]]));

        component = new BucketListComponent(bucketServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load buckets on init', () => {
            component.ngOnInit();
            expect(bucketServiceSpy.getAvailableBuckets).toHaveBeenCalled();
        });

        it('should populate buckets array', () => {
            component.ngOnInit();
            expect(component.buckets.length).toBe(2);
        });

        it('should populate allBuckets array', () => {
            component.ngOnInit();
            expect(component.allBuckets.length).toBe(2);
        });
    });

    describe('applyFilter', () => {
        it('should filter by difficulty when filterDifficulty is set', () => {
            component.ngOnInit();
            component.filterDifficulty = 'MEDIUM';
            component.applyFilter();
            expect(bucketServiceSpy.getBucketsByDifficulty).toHaveBeenCalledWith('MEDIUM');
        });

        it('should restore all buckets when filterDifficulty is empty', () => {
            component.ngOnInit();
            component.filterDifficulty = '';
            component.applyFilter();
            expect(component.buckets).toEqual(component.allBuckets);
        });
    });

    describe('selectBucket', () => {
        it('should not throw on selectBucket', () => {
            expect(() => component.selectBucket(mockBuckets[0])).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadBuckets', () => {
            bucketServiceSpy.getAvailableBuckets.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadBuckets()).not.toThrow();
        });
    });
});
