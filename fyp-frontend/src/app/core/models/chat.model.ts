export interface ChatRoom {
    roomId: number;
    roomType: 'TEAM' | 'DIRECT' | 'MENTOR_TEAM';
    roomName: string;
    teamId?: number;
    projectId?: number;
    participants: ChatParticipant[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    createdAt: Date;
}

export interface ChatParticipant {
    userId: number;
    userName: string;
    userRole: 'STUDENT' | 'MENTOR';
    lastReadAt: Date;
    isOnline: boolean;
}

export interface ChatMessage {
    messageId: number;
    roomId: number;
    userId: number;
    userName: string;
    messageText: string;
    messageType: 'TEXT' | 'CODE' | 'FILE';
    fileUrl?: string;
    fileName?: string;
    createdAt: Date;
    isEdited: boolean;
    editedAt?: Date;
}

export interface SendMessageRequest {
    roomId: number;
    messageText: string;
    messageType: 'TEXT' | 'CODE' | 'FILE';
    fileUrl?: string;
    fileName?: string;
}
