export interface Issue {
    issueId: number;
    projectId: number;
    reportedBy: number;
    reportedByName: string;
    assignedTo?: number;
    assignedToName?: string;
    title: string;
    description: string;
    issueType: 'BUG' | 'FEATURE' | 'ENHANCEMENT' | 'QUESTION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    linkedTaskId?: number;
    linkedTaskTitle?: string;
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
}

export interface IssueComment {
    commentId: number;
    issueId: number;
    userId: number;
    userName: string;
    commentText: string;
    createdAt: Date;
}

export interface CreateIssueRequest {
    projectId: number;
    title: string;
    description: string;
    issueType: 'BUG' | 'FEATURE' | 'ENHANCEMENT' | 'QUESTION';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignedTo?: number;
}

export interface UpdateIssueRequest {
    title?: string;
    description?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    assignedTo?: number;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
