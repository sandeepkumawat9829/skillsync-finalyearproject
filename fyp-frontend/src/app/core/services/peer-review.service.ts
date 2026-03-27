import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PeerReview {
    reviewId?: number;
    projectId: number;
    reviewerId?: number;
    reviewerName?: string;
    revieweeId: number;
    revieweeName?: string;
    technicalSkillsRating: number;
    communicationRating: number;
    teamworkRating: number;
    problemSolvingRating: number;
    overallContributionRating: number;
    anonymousFeedback?: string;
    isAnonymous: boolean;
    createdAt?: Date;
}

export interface PeerReviewSummary {
    userId: number;
    userName: string;
    averageTechnicalSkills?: number;
    averageCommunication?: number;
    averageTeamwork?: number;
    averageProblemSolving?: number;
    averageOverall?: number;
    totalReviewsReceived: number;
}

@Injectable({
    providedIn: 'root'
})
export class PeerReviewService {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/peer-reviews';

    constructor(private http: HttpClient) { }

    /**
     * Submit a peer review
     */
    submitReview(review: PeerReview): Observable<PeerReview> {
        return this.http.post<PeerReview>(this.apiUrl, review);
    }

    /**
     * Get feedback received for a project
     */
    getMyFeedback(projectId: number): Observable<PeerReview[]> {
        return this.http.get<PeerReview[]>(`${this.apiUrl}/projects/${projectId}/my-feedback`);
    }

    /**
     * Get reviews I have submitted
     */
    getMySubmittedReviews(): Observable<PeerReview[]> {
        return this.http.get<PeerReview[]>(`${this.apiUrl}/my-reviews`);
    }

    /**
     * Get my review summary
     */
    getMySummary(): Observable<PeerReviewSummary> {
        return this.http.get<PeerReviewSummary>(`${this.apiUrl}/my-summary`);
    }

    /**
     * Get user summary (for mentors)
     */
    getUserSummary(userId: number): Observable<PeerReviewSummary> {
        return this.http.get<PeerReviewSummary>(`${this.apiUrl}/users/${userId}/summary`);
    }
}
