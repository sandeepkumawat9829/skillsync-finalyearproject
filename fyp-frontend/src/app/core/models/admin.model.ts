export interface SystemAnalytics {
    totalUsers: number;
    totalStudents: number;
    totalMentors: number;
    totalProjects: number;
    activeTeams: number;
    completedProjects: number;
    usersByRole: { role: string; count: number }[];
    projectsByStatus: { status: string; count: number }[];
    registrationTrend: { date: string; count: number }[];
    projectCreationTrend: { date: string; count: number }[];
}

export interface UserManagement {
    userId: number;
    email: string;
    role: 'STUDENT' | 'MENTOR' | 'ADMIN';
    fullName: string;
    enrollmentNumber?: string;
    employeeId?: string;
    department?: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin?: Date;
}

export interface CollegeBucket {
    bucketId: number;
    title: string;
    description: string;
    department: string;
    technologies: string[];
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
    maxTeams: number;
    allocatedTeams: number;
    availableSlots: number;
    isAvailable: boolean;
    postedById: number;
    postedByName: string;
    postedAt: string;
    deadline: string;
}

export interface CreateBucketRequest {
    title: string;
    description: string;
    department: string;
    technologies: string[];
    difficultyLevel: 'EASY' | 'MEDIUM' | 'HARD';
    maxTeams: number;
    deadline: string;
}
