// Project related models
export interface Project {
    projectId: number;
    title: string;
    abstractText: string;
    fullDescription: string;
    problemStatement?: string;
    objectives?: string;
    methodology?: string;
    expectedOutcome?: string;
    technologies: string[];
    domain: string;
    createdById: number;
    createdByName?: string;
    isFromBucket?: boolean;
    status: 'DRAFT' | 'TEAM_FORMING' | 'TEAM_COMPLETE' | 'PENDING_MENTOR' | 'MENTOR_ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
    visibility: 'PUBLIC' | 'PRIVATE';
    githubRepoUrl?: string;
    createdAt: string;
    teamId?: number;
    teamName?: string;
    teamStatus?: 'FORMING' | 'COMPLETE' | 'ACTIVE' | 'DISBANDED' | 'MENTOR_REQUESTED';
    teamMemberCount?: number;
    hasMentor?: boolean;
    mentorName?: string;
}

export interface CollegeProjectBucket {
    bucketId: number;
    title: string;
    description: string;
    department: string;
    technologies: string[];
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
    maxTeams: number;
    allocatedTeams: number;
    isAvailable: boolean;
    postedBy: number;
    postedAt: Date;
    deadline?: Date;
}

export interface CreateProjectRequest {
    title: string;
    abstractText: string;
    fullDescription: string;
    problemStatement?: string;
    objectives?: string;
    methodology?: string;
    expectedOutcome?: string;
    technologies: string[];
    domain: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    fromBucket?: boolean;
    bucketId?: number;
}

// Team related models
export interface Team {
    teamId: number;
    teamName: string;
    projectId: number;
    projectTitle?: string;
    teamLeaderId: number;
    members: TeamMember[];
    currentMemberCount: number;
    maxMembers: number;
    isComplete: boolean;
    status: 'FORMING' | 'COMPLETE' | 'MENTOR_REQUESTED' | 'ACTIVE' | 'DISBANDED';
    mentorId?: number;
    mentorName?: string;
    createdAt: Date;
}

export interface TeamMember {
    memberId: number;
    userId: number;
    email?: string;
    fullName: string;
    role: 'LEADER' | 'MEMBER';
    joinedAt: Date;
    contributionScore?: number;
}

export interface TeamInvitation {
    invitationId: number;
    teamId: number;
    teamName?: string;
    fromUserId: number;
    fromUserName?: string;
    toUserId: number;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: Date;
    respondedAt?: Date;
}

export interface CreateTeamRequest {
    teamName: string;
    projectId: number;
    maxMembers: number;
}

export interface InviteMemberRequest {
    teamId: number;
    toUserId?: number;
    email?: string;
    message: string;
}

// Mentor related models
export interface MentorRequest {
    requestId: number;
    teamId: number;
    mentorId: number;
    mentorName?: string;
    projectId: number;
    projectTitle?: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    requestedAt: Date;
    respondedAt?: Date;
}

export interface MentorAssignment {
    assignmentId: number;
    teamId: number;
    mentorId: number;
    mentorName?: string;
    projectId: number;
    assignedAt: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}
