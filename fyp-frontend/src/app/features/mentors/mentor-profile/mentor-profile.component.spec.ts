import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MentorProfileComponent } from './mentor-profile.component';
import { MentorService } from '../../../core/services/mentor.service';
import { ProjectService } from '../../../core/services/project.service';

describe('MentorProfileComponent', () => {
    let component: MentorProfileComponent;
    let mentorServiceSpy: jasmine.SpyObj<MentorService>;
    let projectServiceSpy: jasmine.SpyObj<ProjectService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    const mockMentor = {
        mentorId: 10,
        userId: 5,
        fullName: 'Dr. Smith',
        email: 'mentor@example.com',
        department: 'Computer Science',
        designation: 'Professor',
        expertise: ['Python', 'Machine Learning'],
        bio: 'A professor of computer science',
        experience: 8,
        maxStudents: 5,
        currentStudents: 2,
        isAvailable: true
    };

    const mockProjects = [
        { projectId: 1, title: 'Project A', status: 'APPROVED' },
        { projectId: 2, title: 'Project B', status: 'COMPLETED' }
    ] as any[];

    beforeEach(() => {
        mentorServiceSpy = jasmine.createSpyObj('MentorService', ['getMentorById', 'sendMentorRequest']);
        projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getMyProjects']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        mentorServiceSpy.getMentorById.and.returnValue(of(mockMentor as any));
        mentorServiceSpy.sendMentorRequest.and.returnValue(of({}));
        projectServiceSpy.getMyProjects.and.returnValue(of(mockProjects as any));

        const mockActivatedRoute = {
            params: of({ id: 10 }),
            queryParams: of({})
        } as any as ActivatedRoute;

        component = new MentorProfileComponent(
            mockActivatedRoute,
            routerSpy,
            mentorServiceSpy,
            projectServiceSpy,
            new FormBuilder(),
            snackBarSpy
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load mentor and active projects on init', () => {
        component.ngOnInit();

        expect(mentorServiceSpy.getMentorById).toHaveBeenCalledWith(10);
        expect(projectServiceSpy.getMyProjects).toHaveBeenCalled();
        expect(component.mentor?.fullName).toBe('Dr. Smith');
        expect(component.myProjects.length).toBe(1);
    });

    it('should navigate back when mentor loading fails', () => {
        mentorServiceSpy.getMentorById.and.returnValue(throwError(() => new Error('failed')));

        component.ngOnInit();

        expect(snackBarSpy.open).toHaveBeenCalledWith('Error loading mentor profile', 'Close', jasmine.any(Object));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/mentors']);
    });

    it('should navigate back', () => {
        component.goBack();

        expect(routerSpy.navigate).toHaveBeenCalledWith(['/student/mentors']);
    });
});
