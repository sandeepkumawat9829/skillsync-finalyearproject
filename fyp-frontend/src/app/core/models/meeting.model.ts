export interface Meeting {
    id: number;
    teamId: number;
    teamName?: string;
    mentorId?: number;
    mentorName?: string;
    title: string;
    description: string;
    agenda?: string;
    meetingType?: 'ONLINE' | 'OFFLINE' | 'REVIEW' | 'DISCUSSION' | 'PRESENTATION';
    scheduledAt: Date;
    durationMinutes: number;
    location?: string;
    meetingLink?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'IN_PROGRESS';
    notes?: string;
    attendees?: MeetingAttendee[];
    attendeeNames?: string[];
    createdAt?: Date;
    createdBy?: number;
    projectId?: number;
    projectTitle?: string;
}

export interface MeetingAttendee {
    userId: number;
    userName: string;
    role: 'STUDENT' | 'MENTOR';
    status: 'ATTENDING' | 'TENTATIVE' | 'ABSENT';
}

export interface CreateMeetingRequest {
    teamId: number;
    title: string;
    description: string;
    meetingType: string;
    scheduledAt: Date;
    durationMinutes: number;
    location?: string;
    meetingLink?: string;
    mentorId?: number;
}
