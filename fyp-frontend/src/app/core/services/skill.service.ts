import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Skill {
    skillId?: number;
    skillName: string;
    category?: string;
}

export interface StudentSkill {
    studentId: number;
    skillId: number;
    skillName?: string;
    category?: string;
    proficiencyLevel: string;
}

export interface SkillBreakdown {
    skillName: string;
    category: string;
    avgProficiency: number;
    membersWithSkill: number;
}

export interface SkillAnalytics {
    categoryScores: { [key: string]: number };  // e.g., {"FRONTEND": 85, "BACKEND": 70}
    skillBreakdown: SkillBreakdown[];
    topSkills: string[];
    missingSkills: string[];
    overallCoverage: number;
    teamMemberCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class SkillCatalogService {
    private apiUrl = '/api/skills';

    constructor(private http: HttpClient) { }

    // Skill catalog
    getAllSkills(): Observable<Skill[]> {
        return this.http.get<Skill[]>(this.apiUrl);
    }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/categories`);
    }

    getSkillsByCategory(category: string): Observable<Skill[]> {
        return this.http.get<Skill[]>(`${this.apiUrl}/category/${category}`);
    }

    getSkill(skillId: number): Observable<Skill> {
        return this.http.get<Skill>(`${this.apiUrl}/${skillId}`);
    }

    createSkill(skill: Skill): Observable<Skill> {
        return this.http.post<Skill>(this.apiUrl, skill);
    }

    // Student skills
    getStudentSkills(studentId: number): Observable<StudentSkill[]> {
        return this.http.get<StudentSkill[]>(`${this.apiUrl}/student/${studentId}`);
    }

    addStudentSkill(studentId: number, skillId: number, proficiencyLevel: string): Observable<StudentSkill> {
        return this.http.post<StudentSkill>(`${this.apiUrl}/student/${studentId}`, { skillId, proficiencyLevel });
    }

    removeStudentSkill(studentId: number, skillId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/student/${studentId}/skill/${skillId}`);
    }

    // Mentor specializations
    getMentorSpecializations(mentorId: number): Observable<Skill[]> {
        return this.http.get<Skill[]>(`${this.apiUrl}/mentor/${mentorId}`);
    }

    addMentorSpecialization(mentorId: number, skillId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/mentor/${mentorId}/skill/${skillId}`, {});
    }

    removeMentorSpecialization(mentorId: number, skillId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/mentor/${mentorId}/skill/${skillId}`);
    }

    // Search
    findStudentsWithSkills(skillIds: number[]): Observable<number[]> {
        return this.http.post<number[]>(`${this.apiUrl}/search/students`, skillIds);
    }

    findMentorsWithSkills(skillIds: number[]): Observable<number[]> {
        return this.http.post<number[]>(`${this.apiUrl}/search/mentors`, skillIds);
    }

    // Team skill analytics for radar chart
    getTeamSkillGraph(teamId: number): Observable<SkillAnalytics> {
        return this.http.get<SkillAnalytics>(`${this.apiUrl}/teams/${teamId}/skill-graph`);
    }
}

