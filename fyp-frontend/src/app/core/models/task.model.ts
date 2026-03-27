export interface Task {
    taskId: number;
    projectId: number;
    sprintId?: number;
    teamId?: number;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    position?: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: number; // userId
    assignedToName?: string;
    createdBy: number;
    createdByName: string;
    dueDate?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    estimatedHours?: number;
    actualHours?: number;
}

export interface TaskColumn {
    id: string;
    title: string;
    tasks: Task[];
}

export interface CreateTaskRequest {
    projectId: number;
    sprintId?: number;
    teamId?: number;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: number;
    dueDate?: Date;
    tags?: string[];
    estimatedHours?: number;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedTo?: number;
    dueDate?: Date;
    tags?: string[];
    estimatedHours?: number;
    actualHours?: number;
    sprintId?: number;
}

export interface ReorderTaskRequest {
    taskId: number;
    status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    position: number;
}

export interface TaskBoardEvent {
    eventType: string;
    payload: unknown;
}
