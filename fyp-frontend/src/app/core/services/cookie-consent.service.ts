import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CookiePreferences {
    essential: boolean;    // Always true — auth, security
    analytics: boolean;    // Google Analytics, etc.
    performance: boolean;  // Performance monitoring
    marketing: boolean;    // Ads, tracking
    timestamp: string;     // ISO date of consent
}

const COOKIE_CONSENT_KEY = 'cookieConsent';

const DEFAULT_PREFERENCES: CookiePreferences = {
    essential: true,
    analytics: false,
    performance: false,
    marketing: false,
    timestamp: ''
};

@Injectable({
    providedIn: 'root'
})
export class CookieConsentService {
    private consentSubject = new BehaviorSubject<CookiePreferences | null>(this.getStoredConsent());

    get consent$(): Observable<CookiePreferences | null> {
        return this.consentSubject.asObservable();
    }

    hasConsented(): boolean {
        return this.getStoredConsent() !== null;
    }

    getConsent(): CookiePreferences | null {
        return this.getStoredConsent();
    }

    acceptAll(): void {
        const preferences: CookiePreferences = {
            essential: true,
            analytics: true,
            performance: true,
            marketing: true,
            timestamp: new Date().toISOString()
        };
        this.saveConsent(preferences);
    }

    rejectAll(): void {
        const preferences: CookiePreferences = {
            essential: true, // Essential cookies are always on
            analytics: false,
            performance: false,
            marketing: false,
            timestamp: new Date().toISOString()
        };
        this.saveConsent(preferences);
    }

    saveCustom(preferences: Partial<CookiePreferences>): void {
        const consent: CookiePreferences = {
            essential: true, // Always true
            analytics: preferences.analytics ?? false,
            performance: preferences.performance ?? false,
            marketing: preferences.marketing ?? false,
            timestamp: new Date().toISOString()
        };
        this.saveConsent(consent);
    }

    resetConsent(): void {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        this.consentSubject.next(null);
    }

    private saveConsent(preferences: CookiePreferences): void {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
        this.consentSubject.next(preferences);
    }

    private getStoredConsent(): CookiePreferences | null {
        const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
        return null;
    }
}
