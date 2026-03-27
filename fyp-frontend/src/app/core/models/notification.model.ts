export interface Notification {
    notificationId: number;
    userId: number;
    type: 'TEAM_INVITE' | 'TASK_ASSIGNED' | 'MENTOR_RESPONSE' | 'PROJECT_UPDATE' | 'SYSTEM';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    actionUrl?: string;
}
