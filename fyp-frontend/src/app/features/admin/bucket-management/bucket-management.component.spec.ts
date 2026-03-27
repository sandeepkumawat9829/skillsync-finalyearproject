import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BucketManagementComponent } from './bucket-management.component';
import { AdminService } from '../../../core/services/admin.service';

describe('BucketManagementComponent', () => {
    let component: BucketManagementComponent;
    let adminServiceSpy: jasmine.SpyObj<AdminService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockBuckets = [
        {
            bucketId: 1,
            title: 'AI Project Bucket',
            description: 'AI projects',
            difficultyLevel: 'MEDIUM',
            technologies: ['Python'],
            maxTeams: 10,
            isActive: true
        }
    ];

    beforeEach(() => {
        adminServiceSpy = jasmine.createSpyObj('AdminService', [
            'getAllBuckets', 'createBucket', 'updateBucket', 'deleteBucket'
        ]);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        adminServiceSpy.getAllBuckets.and.returnValue(of(mockBuckets));
        adminServiceSpy.createBucket.and.returnValue(of(mockBuckets[0]));
        adminServiceSpy.updateBucket.and.returnValue(of(mockBuckets[0]));
        adminServiceSpy.deleteBucket.and.returnValue(of(void 0));

        component = new BucketManagementComponent(adminServiceSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load buckets on init', () => {
            component.ngOnInit();
            expect(adminServiceSpy.getAllBuckets).toHaveBeenCalled();
        });

        it('should populate buckets array', () => {
            component.ngOnInit();
            expect(component.buckets.length).toBe(1);
        });
    });
});
