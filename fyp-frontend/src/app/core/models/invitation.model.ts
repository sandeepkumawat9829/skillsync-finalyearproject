export interface TeamInvitation {
    invitationId: number;
    teamId: number;
    teamName?: string;
    projectTitle?: string;
    fromUserId: number;
    fromUserName: string;
    toUserId: number;
    message?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: Date;
    respondedAt?: Date;
}

export interface JoinRequest {
    requestId: number;
    teamId: number;
    teamName: string;
    fromUserId: number;
    fromUserName: string;
    fromUserEmail: string;
    message: string;
    status: string;
    createdAt: string;
}
