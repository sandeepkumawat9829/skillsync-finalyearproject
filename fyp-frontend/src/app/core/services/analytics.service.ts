import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { BurndownData, VelocityData, ContributionData, SprintMetrics, AnalyticsOverview, TimeBasedMetrics } from '../models/analytics.model';

export interface ProjectAnalytics {
    burndownData: BurndownData[];
    velocityData: VelocityData[];
    contributionData: ContributionData[];
    overview: AnalyticsOverview;
    sprintMetrics: SprintMetrics[];
    timeMetrics?: {
        totalHoursLogged: number;
        averageHoursPerTask: number;
        hoursThisWeek: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/analytics';

    constructor(private http: HttpClient) { }

    // Get complete project analytics
    getProjectAnalytics(projectId: number): Observable<ProjectAnalytics> {
        return this.http.get<any>(`${this.apiUrl}/project/${projectId}`).pipe(
            map(analytics => this.mapProjectAnalytics(analytics))
        );
    }

    // Get burndown data for current sprint
    getBurndownData(projectId: number, sprintId: number): Observable<BurndownData[]> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => analytics.burndownData)
        );
    }

    // Get velocity data for last sprints
    getVelocityData(projectId: number): Observable<VelocityData[]> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => analytics.velocityData)
        );
    }

    // Get team contribution breakdown
    getContributionData(projectId: number): Observable<ContributionData[]> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => analytics.contributionData)
        );
    }

    // Get sprint metrics history
    getSprintMetrics(projectId: number): Observable<SprintMetrics[]> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => analytics.sprintMetrics)
        );
    }

    // Get analytics overview
    getAnalyticsOverview(projectId: number): Observable<AnalyticsOverview> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => analytics.overview)
        );
    }

    // Get time-based metrics
    getTimeBasedMetrics(projectId: number, days: number = 30): Observable<TimeBasedMetrics[]> {
        return this.getProjectAnalytics(projectId).pipe(
            map(analytics => [{
                date: new Date(),
                tasksCompleted: analytics.overview.totalTasksCompleted || 0,
                tasksCreated: analytics.overview.totalTasksCompleted || 0
            }])
        );
    }

    private mapProjectAnalytics(analytics: any): ProjectAnalytics {
        const overview: AnalyticsOverview = {
            currentVelocity: analytics.currentVelocity ?? 0,
            sprintProgress: analytics.sprintProgress ?? 0,
            completionRate: analytics.completionRate ?? 0,
            totalTasksCompleted: analytics.totalTasksCompleted ?? 0,
            averageVelocity: analytics.averageVelocity ?? 0,
            teamEfficiency: analytics.teamEfficiency ?? 'low'
        };

        const burndownData: BurndownData[] = (analytics.burndownData || []).map((item: any) => ({
            date: item.date,
            idealRemaining: item.idealRemaining,
            actualRemaining: item.actualRemaining
        }));

        const velocityData: VelocityData[] = (analytics.velocityData || []).map((item: any) => ({
            sprintName: item.sprintName,
            completedPoints: item.completedPoints,
            committedPoints: item.committedPoints,
            completionPercentage: item.completionPercentage
        }));

        const palette = ['#ff5754', '#ff9a76', '#204f46', '#b9852f', '#5b7cfa', '#55b88a'];
        const contributionData: ContributionData[] = (analytics.contributionData || []).map((item: any, index: number) => ({
            memberName: item.memberName,
            tasksCompleted: item.tasksCompleted,
            percentage: item.percentage,
            color: palette[index % palette.length]
        }));

        const sprintMetrics: SprintMetrics[] = (analytics.sprintMetrics || []).map((item: any) => ({
            sprintNumber: item.sprintNumber,
            sprintName: item.sprintName,
            startDate: item.startDate,
            endDate: item.endDate,
            totalTasks: item.totalTasks,
            completedTasks: item.completedTasks,
            completionRate: item.completionRate,
            velocity: item.velocity,
            committedPoints: item.committedPoints
        }));

        return {
            burndownData,
            velocityData,
            contributionData,
            overview,
            sprintMetrics,
            timeMetrics: analytics.timeMetrics
        };
    }
}
