import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnouncementService, Announcement } from '../../core/services/announcement.service';

@Component({
    selector: 'app-announcement-list',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="announcement-container">
            <h2>📢 Announcements</h2>
            
            <div *ngIf="importantAnnouncements.length > 0" class="important-section">
                <div *ngFor="let announcement of importantAnnouncements" class="announcement-card important">
                    <div class="badge">⚠️ IMPORTANT</div>
                    <h3>{{ announcement.title }}</h3>
                    <p>{{ announcement.content }}</p>
                    <div class="meta">
                        <span>Posted by: {{ announcement.postedByName }}</span>
                        <span>{{ announcement.createdAt | date:'medium' }}</span>
                    </div>
                </div>
            </div>
            
            <div class="announcement-list">
                <div *ngFor="let announcement of announcements" 
                     class="announcement-card"
                     [class]="announcement.announcementType?.toLowerCase()">
                    <div class="type-badge" [class]="announcement.announcementType?.toLowerCase()">
                        {{ getTypeIcon(announcement.announcementType) }} {{ announcement.announcementType }}
                    </div>
                    <h3>{{ announcement.title }}</h3>
                    <p>{{ announcement.content }}</p>
                    <div class="meta">
                        <span>{{ announcement.createdAt | date:'medium' }}</span>
                        <span *ngIf="announcement.expiresAt">
                            Expires: {{ announcement.expiresAt | date:'mediumDate' }}
                        </span>
                    </div>
                </div>
            </div>
            
            <div *ngIf="announcements.length === 0 && importantAnnouncements.length === 0" class="empty-state">
                <p>No announcements at this time.</p>
            </div>
        </div>
    `,
    styles: [`
        .announcement-container { padding: 20px; max-width: 800px; margin: 0 auto; }
        h2 { margin-bottom: 20px; }
        .important-section { margin-bottom: 30px; }
        .announcement-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; }
        .announcement-card.important { border: 2px solid #f44336; background: #fff5f5; }
        .announcement-card.deadline { border-left: 4px solid #ff9800; }
        .announcement-card.event { border-left: 4px solid #2196f3; }
        .announcement-card.general { border-left: 4px solid #9e9e9e; }
        .badge { position: absolute; top: 10px; right: 10px; background: #f44336; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .type-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; margin-bottom: 10px; }
        .type-badge.deadline { background: #fff3e0; color: #ff9800; }
        .type-badge.event { background: #e3f2fd; color: #2196f3; }
        .type-badge.general { background: #f5f5f5; color: #666; }
        .type-badge.important { background: #ffebee; color: #f44336; }
        h3 { margin: 0 0 10px; color: #333; }
        p { color: #555; line-height: 1.6; }
        .meta { display: flex; justify-content: space-between; color: #888; font-size: 12px; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; }
        .empty-state { text-align: center; padding: 40px; color: #666; }
    `]
})
export class AnnouncementListComponent implements OnInit {
    announcements: Announcement[] = [];
    importantAnnouncements: Announcement[] = [];

    constructor(private announcementService: AnnouncementService) { }

    ngOnInit() {
        this.loadAnnouncements();
        this.loadImportant();
    }

    loadAnnouncements() {
        this.announcementService.getActiveAnnouncements().subscribe({
            next: (data: Announcement[]) => this.announcements = data.filter(a => a.announcementType !== 'IMPORTANT'),
            error: (err: Error) => console.error('Error loading announcements', err)
        });
    }

    loadImportant() {
        this.announcementService.getImportantAnnouncements().subscribe({
            next: (data: Announcement[]) => this.importantAnnouncements = data,
            error: (err: Error) => console.error('Error loading important', err)
        });
    }

    getTypeIcon(type?: string): string {
        switch (type) {
            case 'DEADLINE': return '📅';
            case 'EVENT': return '🎉';
            case 'IMPORTANT': return '⚠️';
            default: return '📌';
        }
    }
}
