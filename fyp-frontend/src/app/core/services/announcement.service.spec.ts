import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnnouncementService, Announcement } from './announcement.service';

describe('AnnouncementService', () => {
    let service: AnnouncementService;
    let httpMock: HttpTestingController;

    const mockAnnouncement: Announcement = {
        announcementId: 1,
        postedById: 1,
        postedByName: 'Admin User',
        title: 'Test Announcement',
        content: 'This is a test announcement',
        announcementType: 'GENERAL',
        targetAudience: 'ALL',
        isActive: true,
        createdAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AnnouncementService]
        });
        service = TestBed.inject(AnnouncementService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getActiveAnnouncements', () => {
        it('should fetch active announcements with default audience', () => {
            service.getActiveAnnouncements().subscribe(announcements => {
                expect(announcements.length).toBe(1);
            });

            const req = httpMock.expectOne('/api/announcements?audience=ALL');
            expect(req.request.method).toBe('GET');
            req.flush([mockAnnouncement]);
        });

        it('should fetch announcements with specific audience', () => {
            service.getActiveAnnouncements('STUDENTS').subscribe();

            const req = httpMock.expectOne('/api/announcements?audience=STUDENTS');
            expect(req.request.method).toBe('GET');
            req.flush([mockAnnouncement]);
        });
    });

    describe('getAllAnnouncements', () => {
        it('should fetch all announcements', () => {
            service.getAllAnnouncements().subscribe(announcements => {
                expect(announcements).toEqual([mockAnnouncement]);
            });

            const req = httpMock.expectOne('/api/announcements/all');
            expect(req.request.method).toBe('GET');
            req.flush([mockAnnouncement]);
        });
    });

    describe('getImportantAnnouncements', () => {
        it('should fetch important announcements', () => {
            service.getImportantAnnouncements().subscribe();

            const req = httpMock.expectOne('/api/announcements/important');
            expect(req.request.method).toBe('GET');
            req.flush([mockAnnouncement]);
        });
    });

    describe('getAnnouncement', () => {
        it('should fetch single announcement by ID', () => {
            service.getAnnouncement(1).subscribe(announcement => {
                expect(announcement).toEqual(mockAnnouncement);
            });

            const req = httpMock.expectOne('/api/announcements/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockAnnouncement);
        });
    });

    describe('createAnnouncement', () => {
        it('should send POST request to create announcement', () => {
            const newAnnouncement: Announcement = {
                title: 'New Announcement',
                content: 'Content',
                announcementType: 'IMPORTANT',
                targetAudience: 'MENTORS'
            };

            service.createAnnouncement(newAnnouncement, 1).subscribe(result => {
                expect(result).toEqual(mockAnnouncement);
            });

            const req = httpMock.expectOne('/api/announcements?userId=1');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newAnnouncement);
            req.flush(mockAnnouncement);
        });
    });

    describe('updateAnnouncement', () => {
        it('should send PUT request to update announcement', () => {
            service.updateAnnouncement(1, mockAnnouncement).subscribe(result => {
                expect(result).toEqual(mockAnnouncement);
            });

            const req = httpMock.expectOne('/api/announcements/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockAnnouncement);
        });
    });

    describe('deleteAnnouncement', () => {
        it('should send DELETE request', () => {
            service.deleteAnnouncement(1).subscribe();

            const req = httpMock.expectOne('/api/announcements/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
