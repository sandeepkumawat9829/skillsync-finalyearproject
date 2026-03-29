import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CookieConsentService, CookiePreferences } from '../../../core/services/cookie-consent.service';

@Component({
    selector: 'app-cookie-consent',
    templateUrl: './cookie-consent.component.html',
    styleUrls: ['./cookie-consent.component.scss'],
    animations: [
        trigger('slideUp', [
            transition(':enter', [
                style({ transform: 'translateY(100%)', opacity: 0 }),
                animate('400ms cubic-bezier(0.16, 1, 0.3, 1)',
                    style({ transform: 'translateY(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms cubic-bezier(0.4, 0, 1, 1)',
                    style({ transform: 'translateY(100%)', opacity: 0 }))
            ])
        ]),
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('300ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('250ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class CookieConsentComponent implements OnInit {
    showBanner = false;
    showCustomize = false;

    preferences = {
        analytics: false,
        performance: false,
        marketing: false
    };

    constructor(private cookieConsentService: CookieConsentService) {}

    ngOnInit(): void {
        // Show banner only if user hasn't given consent yet
        if (!this.cookieConsentService.hasConsented()) {
            // Small delay for smoother page load experience
            setTimeout(() => {
                this.showBanner = true;
            }, 1500);
        }
    }

    acceptAll(): void {
        this.cookieConsentService.acceptAll();
        this.showBanner = false;
    }

    rejectAll(): void {
        this.cookieConsentService.rejectAll();
        this.showBanner = false;
        this.showCustomize = false;
    }

    openCustomize(): void {
        this.showCustomize = true;
    }

    closeCustomize(): void {
        this.showCustomize = false;
    }

    saveCustomPreferences(): void {
        this.cookieConsentService.saveCustom(this.preferences);
        this.showBanner = false;
        this.showCustomize = false;
    }
}
