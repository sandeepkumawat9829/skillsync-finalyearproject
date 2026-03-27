export interface TimeEntry {
    timeEntryId: number;
    taskId: number;
    taskTitle: string;
    userId: number;
    userName: string;
    projectId: number;
    sprintId?: number;
    hours: number;
    date: Date;
    description: string;
    createdAt: Date;
}

export interface TimeReport {
    userId: number;
    userName: string;
    totalHours: number;
    averageDailyHours: number;
    taskBreakdown: TaskTimeBreakdown[];
    dailyHours: DailyHours[];
}

export interface TaskTimeBreakdown {
    taskId: number;
    taskTitle: string;
    hours: number;
    percentage: number;
}

export interface DailyHours {
    date: Date;
    hours: number;
}

export interface TeamTimeReport {
    projectId: number;
    totalHours: number;
    memberContributions: MemberContribution[];
    taskDistribution: TaskTimeBreakdown[];
}

export interface MemberContribution {
    userId: number;
    userName: string;
    hours: number;
    percentage: number;
    color: string;
}

export interface LogTimeRequest {
    taskId: number;
    hours: number;
    date: Date;
    description: string;
}

export type ReportPeriod = 'today' | 'week' | 'month' | 'custom';
