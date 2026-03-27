export interface User {
    userId: number;
    email: string;
    role: 'STUDENT' | 'MENTOR' | 'ADMIN';
    token?: string;
}

export interface StudentProfile {
    profileId: number;
    userId: number;
    fullName: string;
    enrollmentNumber: string;
    branch: string;
    currentSemester: number;
    cgpa: number;
    phone?: string;
    bio?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    profileImageUrl?: string;
}

export interface MentorProfile {
    profileId: number;
    userId: number;
    fullName: string;
    employeeId: string;
    department: string;
    designation?: string;
    specialization?: string[];
    maxProjectsAllowed: number;
    currentProjectCount: number;
    phone?: string;
    officeLocation?: string;
    bio?: string;
    profileImageUrl?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    role: 'STUDENT' | 'MENTOR';
    fullName?: string; // Optional - will be filled in profile wizard
    // Student fields
    enrollmentNumber?: string;
    branch?: string;
    currentSemester?: number | null;
    cgpa?: number | null;
    skills?: string[];
    // Mentor fields
    employeeId?: string;
    department?: string;
    designation?: string;
    specializations?: string[];
    maxProjectsAllowed?: number | null;
    // Common optional
    phone?: string;
    bio?: string;
}

// Backend returns flat response from LoginResponse.java
export interface AuthResponse {
    token: string;
    type: string;
    userId: number;
    email: string;
    role: string;
    fullName: string;
    profileCompleted?: boolean;
}
