import { of, throwError } from 'rxjs';
import { AnnouncementListComponent } from './announcement-list.component';
import { AnnouncementService, Announcement } from '../../core/services/announcement.service';

describe('AnnouncementListComponent', () => {
    let component: AnnouncementListComponent;
    let announcementServiceSpy: jasmine.SpyObj<AnnouncementService>;

    const mockAnnouncements: Announcement[] = [
        {
            announcementId: 1,
            title: 'General Update',
            content: 'Some content',
            announcementType: 'GENERAL',
            targetAudience: 'ALL',
            postedBy: 1,
            postedByName: 'Admin',
            createdAt: new Date(),
            isActive: true
        },
        {
            announcementId: 2,
            title: 'Deadline Reminder',
            content: 'Submit by Friday',
            announcementType: 'DEADLINE',
            targetAudience: 'STUDENTS',
            postedBy: 1,
            postedByName: 'Admin',
            createdAt: new Date(),
            isActive: true
        }
    ];

    const mockImportant: Announcement[] = [
        {
            announcementId: 3,
            title: 'Important Notice',
            content: 'Very important',
            announcementType: 'IMPORTANT',
            targetAudience: 'ALL',
            postedBy: 1,
            postedByName: 'Admin',
            createdAt: new Date(),
            isActive: true
        }
    ];

    beforeEach(() => {
        announcementServiceSpy = jasmine.createSpyObj('AnnouncementService', ['getActiveAnnouncements', 'getImportantAnnouncements']);
        announcementServiceSpy.getActiveAnnouncements.and.returnValue(of(mockAnnouncements));
        announcementServiceSpy.getImportantAnnouncements.and.returnValue(of(mockImportant));

        component = new AnnouncementListComponent(announcementServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load announcements on init', () => {
            component.ngOnInit();
            expect(announcementServiceSpy.getActiveAnnouncements).toHaveBeenCalled();
        });

        it('should load important announcements on init', () => {
            component.ngOnInit();
            expect(announcementServiceSpy.getImportantAnnouncements).toHaveBeenCalled();
        });

        it('should filter out IMPORTANT from regular announcements', () => {
            component.ngOnInit();
            expect(component.announcements.every(a => a.announcementType !== 'IMPORTANT')).toBeTrue();
        });

        it('should populate important announcements', () => {
            component.ngOnInit();
            expect(component.importantAnnouncements.length).toBe(1);
        });
    });

    describe('getTypeIcon', () => {
        it('should return deadline icon', () => {
            expect(component.getTypeIcon('DEADLINE')).toBe('📅');
        });

        it('should return event icon', () => {
            expect(component.getTypeIcon('EVENT')).toBe('🎉');
        });

        it('should return important icon', () => {
            expect(component.getTypeIcon('IMPORTANT')).toBe('⚠️');
        });

        it('should return default icon for unknown type', () => {
            expect(component.getTypeIcon('UNKNOWN')).toBe('📌');
        });

        it('should return default icon for undefined', () => {
            expect(component.getTypeIcon(undefined)).toBe('📌');
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadAnnouncements', () => {
            announcementServiceSpy.getActiveAnnouncements.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadAnnouncements()).not.toThrow();
        });

        it('should handle error on loadImportant', () => {
            announcementServiceSpy.getImportantAnnouncements.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadImportant()).not.toThrow();
        });
    });
});
