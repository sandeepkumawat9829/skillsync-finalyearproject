export interface Mentor {
    mentorId: number;
    userId: number;
    fullName: string;
    email: string;
    department: string;
    designation: string;
    expertise: string[];
    bio: string;
    profileImageUrl?: string;
    experience: number;
    maxStudents: number;
    currentStudents: number;
    isAvailable: boolean;
    rating?: number;
    totalProjects?: number;
}

export interface MentorRequest {
    requestId: number;
    teamId: number;
    teamName: string;
    projectId: number;
    projectTitle: string;
    projectAbstract: string;
    projectDomain: string;
    teamLeaderId: number;
    teamLeaderName: string;
    teamMembers: TeamMemberInfo[];
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    requestedAt: Date;
    respondedAt?: Date;
}

export interface TeamMemberInfo {
    userId: number;
    name: string;
    role?: string;
    skills?: string[];
    branch?: string;
}

export interface MentorStats {
    pendingRequests: number;
    assignedTeams: number;
    upcomingMeetings: number;
    totalProjects: number;
}

export interface AssignedTeam {
    teamId: number;
    teamName: string;
    projectId: number;
    projectTitle: string;
    projectStatus: string;
    memberCount: number;
    progress: number;
    assignedAt: Date;
    status: string;
}
