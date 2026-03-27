import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TemplateService, ProjectTemplate } from './template.service';

describe('TemplateService', () => {
    let service: TemplateService;
    let httpMock: HttpTestingController;

    const mockTemplate: ProjectTemplate = {
        templateId: 1,
        templateName: 'Web Application Template',
        domain: 'Web Development',
        description: 'Template for web applications',
        objectivesTemplate: 'Build a web application that...',
        methodologyTemplate: 'Agile methodology with sprints...',
        expectedOutcomeTemplate: 'A fully functional web app...',
        suggestedTechnologies: ['Angular', 'Spring Boot', 'PostgreSQL'],
        requiredSkills: ['JavaScript', 'Java', 'SQL'],
        isActive: true
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TemplateService]
        });
        service = TestBed.inject(TemplateService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getAllTemplates', () => {
        it('should fetch all templates', () => {
            service.getAllTemplates().subscribe(templates => {
                expect(templates.length).toBe(1);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates');
            expect(req.request.method).toBe('GET');
            req.flush([mockTemplate]);
        });
    });

    describe('getTemplatesByDomain', () => {
        it('should fetch templates by domain', () => {
            service.getTemplatesByDomain('Web Development').subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates/domain/Web Development');
            expect(req.request.method).toBe('GET');
            req.flush([mockTemplate]);
        });
    });

    describe('getTemplate', () => {
        it('should fetch single template by ID', () => {
            service.getTemplate(1).subscribe(template => {
                expect(template).toEqual(mockTemplate);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockTemplate);
        });
    });

    describe('createTemplate', () => {
        it('should send POST request to create template', () => {
            service.createTemplate(mockTemplate).subscribe(result => {
                expect(result).toEqual(mockTemplate);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(mockTemplate);
            req.flush(mockTemplate);
        });
    });

    describe('updateTemplate', () => {
        it('should send PUT request to update template', () => {
            service.updateTemplate(1, mockTemplate).subscribe(result => {
                expect(result).toEqual(mockTemplate);
            });

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates/1');
            expect(req.request.method).toBe('PUT');
            req.flush(mockTemplate);
        });
    });

    describe('deleteTemplate', () => {
        it('should send DELETE request', () => {
            service.deleteTemplate(1).subscribe();

            const req = httpMock.expectOne('https://skillsync-finalyearproject.onrender.com/api/templates/1');
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
