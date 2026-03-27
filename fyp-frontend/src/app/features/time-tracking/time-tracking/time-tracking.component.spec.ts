import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeTrackingComponent } from './time-tracking.component';
import { TimeTrackingService } from '../../../core/services/time-tracking.service';
import { TaskService } from '../../../core/services/task.service';

describe('TimeTrackingComponent', () => {
    let component: TimeTrackingComponent;
    let timeServiceSpy: jasmine.SpyObj<TimeTrackingService>;
    let taskServiceSpy: jasmine.SpyObj<TaskService>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        timeServiceSpy = jasmine.createSpyObj('TimeTrackingService', [
            'getTimeEntries', 'logTime', 'getTodayHours', 'getWeeklyTimeEntries',
            'deleteTimeEntry', 'formatHours'
        ]);
        taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasksByProject']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        timeServiceSpy.getTimeEntries.and.returnValue(of([]));
        timeServiceSpy.getTodayHours.and.returnValue(of(4));
        timeServiceSpy.getWeeklyTimeEntries.and.returnValue(of([]));
        timeServiceSpy.logTime.and.returnValue(of({}));
        timeServiceSpy.formatHours.and.returnValue('4h');
        taskServiceSpy.getTasksByProject.and.returnValue(of([]));

        component = new TimeTrackingComponent(timeServiceSpy, taskServiceSpy, snackBarSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load tasks on init', () => {
            component.ngOnInit();
            expect(taskServiceSpy.getTasksByProject).toHaveBeenCalled();
        });

        it('should load today hours on init', () => {
            component.ngOnInit();
            expect(timeServiceSpy.getTodayHours).toHaveBeenCalled();
        });
    });

    describe('logTime', () => {
        it('should show error when no task selected', () => {
            component.selectedTaskId = null;
            component.logTime();
            expect(snackBarSpy.open).toHaveBeenCalled();
        });
    });

    describe('formatHours', () => {
        it('should call service formatHours', () => {
            component.formatHours(4);
            expect(timeServiceSpy.formatHours).toHaveBeenCalledWith(4);
        });
    });

    describe('formatDate', () => {
        it('should return formatted date', () => {
            const result = component.formatDate(new Date('2026-01-15'));
            expect(result).toContain('Jan');
        });
    });
});
