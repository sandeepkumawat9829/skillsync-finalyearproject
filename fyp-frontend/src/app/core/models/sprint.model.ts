export interface Sprint {
    sprintId: number;
    projectId: number;
    sprintNumber: number;
    sprintName: string;
    sprintGoal: string;
    startDate: Date;
    endDate: Date;
    status: SprintStatus;
    totalPoints: number;
    completedPoints: number;
    velocity: number;
    createdAt: Date;
    completedAt?: Date;
    taskCount: number;
}

export enum SprintStatus {
    PLANNED = 'PLANNED',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED'
}

export interface SprintRetrospective {
    sprintId: number;
    whatWentWell: string;
    whatNeedsImprovement: string;
    actionItems: string[];
    createdBy: number;
    createdAt: Date;
}

export interface CreateSprintRequest {
    projectId: number;
    sprintName: string;
    sprintGoal: string;
    startDate: Date;
    endDate: Date;
}
