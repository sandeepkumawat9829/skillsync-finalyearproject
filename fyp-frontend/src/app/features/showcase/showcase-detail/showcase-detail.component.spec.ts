import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ShowcaseDetailComponent } from './showcase-detail.component';
import { ShowcaseService } from '../../../core/services/showcase.service';

describe('ShowcaseDetailComponent', () => {
    let component: ShowcaseDetailComponent;
    let showcaseServiceSpy: jasmine.SpyObj<ShowcaseService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockShowcase = {
        showcaseId: 1,
        projectId: 1,
        title: 'AI Project Showcase',
        description: 'Showcase of AI project',
        domain: 'AI_ML',
        technologies: ['Python', 'TensorFlow'],
        thumbnailUrl: 'url',
        videoUrl: 'video-url',
        likeCount: 50,
        viewCount: 500,
        publishedAt: new Date(),
        teamName: 'Team Alpha',
        teamMembers: ['John', 'Jane']
    };

    beforeEach(() => {
        showcaseServiceSpy = jasmine.createSpyObj('ShowcaseService', [
            'getShowcaseById', 'toggleLike', 'incrementViewCount'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        showcaseServiceSpy.getShowcaseById.and.returnValue(of(mockShowcase));
        showcaseServiceSpy.toggleLike.and.returnValue(of({ liked: true }));
        showcaseServiceSpy.incrementViewCount.and.returnValue(of(void 0));

        const mockActivatedRoute = {
            params: of({ id: 1 }),
            snapshot: { paramMap: { get: () => '1' } }
        } as any;

        component = new ShowcaseDetailComponent(
            mockActivatedRoute, showcaseServiceSpy, routerSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load showcase on init', () => {
            component.ngOnInit();
            expect(showcaseServiceSpy.getShowcaseById).toHaveBeenCalled();
        });

        it('should set showcase data', () => {
            component.ngOnInit();
            expect(component.showcase?.title).toBe('AI Project Showcase');
        });
    });

    describe('toggleLike', () => {
        it('should call toggleLike service', () => {
            component.showcase = mockShowcase;
            component.toggleLike();
            expect(showcaseServiceSpy.toggleLike).toHaveBeenCalledWith(1);
        });
    });

    describe('goBack', () => {
        it('should navigate to showcase gallery', () => {
            component.goBack();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/showcase']);
        });
    });

    describe('getDomainIcon', () => {
        it('should return psychology for AI_ML', () => {
            expect(component.getDomainIcon('AI_ML')).toBe('psychology');
        });

        it('should return web for WEB_APP', () => {
            expect(component.getDomainIcon('WEB_APP')).toBe('web');
        });
    });
});
