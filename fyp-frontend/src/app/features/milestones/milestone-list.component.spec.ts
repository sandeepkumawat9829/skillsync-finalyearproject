import { of, throwError } from 'rxjs';
import { MilestoneListComponent } from './milestone-list.component';
import { MilestoneService, Milestone } from '../../core/services/milestone.service';

describe('MilestoneListComponent', () => {
    let component: MilestoneListComponent;
    let milestoneServiceSpy: jasmine.SpyObj<MilestoneService>;

    const mockMilestones: Milestone[] = [
        {
            milestoneId: 1,
            projectId: 1,
            milestoneName: 'Phase 1',
            description: 'Complete design',
            status: 'IN_PROGRESS',
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        milestoneServiceSpy = jasmine.createSpyObj('MilestoneService', [
            'getMilestones', 'getProjectProgress', 'createMilestone',
            'updateMilestone', 'completeMilestone', 'deleteMilestone'
        ]);
        milestoneServiceSpy.getMilestones.and.returnValue(of(mockMilestones));
        milestoneServiceSpy.getProjectProgress.and.returnValue(of({ progress: 50 }));
        milestoneServiceSpy.createMilestone.and.returnValue(of(mockMilestones[0]));
        milestoneServiceSpy.updateMilestone.and.returnValue(of(mockMilestones[0]));
        milestoneServiceSpy.completeMilestone.and.returnValue(of(mockMilestones[0]));
        milestoneServiceSpy.deleteMilestone.and.returnValue(of(void 0));

        component = new MilestoneListComponent(milestoneServiceSpy);
        component.projectId = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load milestones on init', () => {
            component.ngOnInit();
            expect(milestoneServiceSpy.getMilestones).toHaveBeenCalledWith(1);
        });

        it('should load project progress on init', () => {
            component.ngOnInit();
            expect(milestoneServiceSpy.getProjectProgress).toHaveBeenCalledWith(1);
        });

        it('should populate milestones array', () => {
            component.ngOnInit();
            expect(component.milestones.length).toBe(1);
        });

        it('should set project progress', () => {
            component.ngOnInit();
            expect(component.projectProgress).toBe(50);
        });
    });

    describe('createMilestone', () => {
        it('should call createMilestone service', () => {
            component.newMilestone = { projectId: 1, milestoneName: 'New Milestone' };
            component.createMilestone();
            expect(milestoneServiceSpy.createMilestone).toHaveBeenCalled();
        });

        it('should hide add form after creation', () => {
            component.showAddForm = true;
            component.newMilestone = { projectId: 1, milestoneName: 'New Milestone' };
            component.createMilestone();
            expect(component.showAddForm).toBeFalse();
        });
    });

    describe('updateStatus', () => {
        it('should call updateMilestone service', () => {
            component.updateStatus(1, 'COMPLETED');
            expect(milestoneServiceSpy.updateMilestone).toHaveBeenCalledWith(1, { status: 'COMPLETED' });
        });
    });

    describe('completeMilestone', () => {
        it('should call completeMilestone service', () => {
            component.completeMilestone(1);
            expect(milestoneServiceSpy.completeMilestone).toHaveBeenCalledWith(1);
        });
    });

    describe('deleteMilestone', () => {
        it('should call deleteMilestone service', () => {
            component.deleteMilestone(1);
            expect(milestoneServiceSpy.deleteMilestone).toHaveBeenCalledWith(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadMilestones', () => {
            milestoneServiceSpy.getMilestones.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadMilestones()).not.toThrow();
        });
    });
});
