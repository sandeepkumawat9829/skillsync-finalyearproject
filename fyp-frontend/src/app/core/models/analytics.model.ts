export interface BurndownData {
    date: Date;
    idealRemaining: number;
    actualRemaining: number;
}

export interface VelocityData {
    sprintName: string;
    completedPoints: number;
    committedPoints: number;
    completionPercentage: number;
}

export interface ContributionData {
    memberName: string;
    tasksCompleted: number;
    percentage: number;
    color: string;
}

export interface SprintMetrics {
    sprintNumber: number;
    sprintName: string;
    startDate: Date;
    endDate: Date;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
    velocity: number;
    committedPoints: number;
}

export interface AnalyticsOverview {
    currentVelocity: number;
    sprintProgress: number;
    completionRate: number;
    totalTasksCompleted: number;
    averageVelocity: number;
    teamEfficiency: 'low' | 'medium' | 'high';
}

export interface TimeBasedMetrics {
    date: Date;
    tasksCompleted: number;
    tasksCreated: number;
}
