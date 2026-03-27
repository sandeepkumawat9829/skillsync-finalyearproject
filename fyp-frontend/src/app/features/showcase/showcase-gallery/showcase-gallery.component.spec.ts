import { of, throwError } from 'rxjs';
import { ShowcaseGalleryComponent } from './showcase-gallery.component';
import { ShowcaseService } from '../../../core/services/showcase.service';

describe('ShowcaseGalleryComponent', () => {
    let component: ShowcaseGalleryComponent;
    let showcaseServiceSpy: jasmine.SpyObj<ShowcaseService>;

    const mockShowcases = [
        {
            showcaseId: 1,
            projectId: 1,
            title: 'AI Project',
            description: 'An AI project',
            domain: 'AI_ML',
            technologies: ['Python'],
            thumbnailUrl: 'url',
            likeCount: 10,
            viewCount: 100,
            publishedAt: new Date(),
            teamName: 'Team Alpha'
        }
    ];

    beforeEach(() => {
        showcaseServiceSpy = jasmine.createSpyObj('ShowcaseService', [
            'getAllShowcases', 'searchShowcases', 'getShowcasesByDomain', 'toggleLike'
        ]);
        showcaseServiceSpy.getAllShowcases.and.returnValue(of(mockShowcases));
        showcaseServiceSpy.searchShowcases.and.returnValue(of(mockShowcases));
        showcaseServiceSpy.getShowcasesByDomain.and.returnValue(of(mockShowcases));
        showcaseServiceSpy.toggleLike.and.returnValue(of({ liked: true }));

        component = new ShowcaseGalleryComponent(showcaseServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load showcases on init', () => {
            component.ngOnInit();
            expect(showcaseServiceSpy.getAllShowcases).toHaveBeenCalled();
        });

        it('should populate showcases array', () => {
            component.ngOnInit();
            expect(component.showcases.length).toBe(1);
        });
    });

    describe('Filtering', () => {
        it('should search showcases', () => {
            component.searchQuery = 'AI';
            component.searchShowcases();
            expect(showcaseServiceSpy.searchShowcases).toHaveBeenCalledWith('AI');
        });

        it('should filter by domain', () => {
            component.selectedDomain = 'AI_ML';
            component.filterByDomain();
            expect(showcaseServiceSpy.getShowcasesByDomain).toHaveBeenCalledWith('AI_ML');
        });
    });

    describe('Like', () => {
        it('should toggle like', () => {
            component.toggleLike(1);
            expect(showcaseServiceSpy.toggleLike).toHaveBeenCalledWith(1);
        });
    });

    describe('Error Handling', () => {
        it('should handle error on loadShowcases', () => {
            showcaseServiceSpy.getAllShowcases.and.returnValue(throwError(() => new Error('Error')));
            expect(() => component.loadShowcases()).not.toThrow();
        });
    });
});
