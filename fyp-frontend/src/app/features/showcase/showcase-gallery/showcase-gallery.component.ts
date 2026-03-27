import { Component, OnInit } from '@angular/core';
import { ShowcaseService, ProjectShowcase } from '../../../core/services/showcase.service';

@Component({
    selector: 'app-showcase-gallery',
    templateUrl: './showcase-gallery.component.html',
    styleUrls: ['./showcase-gallery.component.css']
})
export class ShowcaseGalleryComponent implements OnInit {
    showcases: ProjectShowcase[] = [];
    loading = true;
    searchQuery = '';
    sortBy = 'recent';
    currentPage = 0;

    constructor(private showcaseService: ShowcaseService) { }

    ngOnInit(): void {
        this.loadShowcases();
    }

    loadShowcases(): void {
        this.loading = true;
        this.showcaseService.getGallery(this.currentPage, 12, this.sortBy).subscribe({
            next: (data) => {
                this.showcases = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading showcases:', err);
                this.loading = false;
            }
        });
    }

    search(): void {
        if (!this.searchQuery.trim()) {
            this.loadShowcases();
            return;
        }
        this.loading = true;
        this.showcaseService.search(this.searchQuery, 0, 12).subscribe({
            next: (data) => {
                this.showcases = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Search error:', err);
                this.loading = false;
            }
        });
    }

    changeSortBy(sort: string): void {
        this.sortBy = sort;
        this.currentPage = 0;
        this.loadShowcases();
    }

    toggleLike(showcase: ProjectShowcase): void {
        this.showcaseService.toggleLike(showcase.showcaseId).subscribe({
            next: (result) => {
                showcase.hasLiked = result.liked;
                showcase.likesCount += result.liked ? 1 : -1;
            },
            error: (err) => console.error('Like error:', err)
        });
    }

    loadMore(): void {
        this.currentPage++;
        this.showcaseService.getGallery(this.currentPage, 12, this.sortBy).subscribe({
            next: (data) => {
                this.showcases = [...this.showcases, ...data];
            }
        });
    }
}
