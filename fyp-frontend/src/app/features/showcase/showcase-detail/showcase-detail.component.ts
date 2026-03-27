import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShowcaseService, ProjectShowcase } from '../../../core/services/showcase.service';

@Component({
    selector: 'app-showcase-detail',
    templateUrl: './showcase-detail.component.html',
    styleUrls: ['./showcase-detail.component.css']
})
export class ShowcaseDetailComponent implements OnInit {
    showcase: ProjectShowcase | null = null;
    loading = true;

    constructor(
        private route: ActivatedRoute,
        private showcaseService: ShowcaseService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadShowcase(+id);
        }
    }

    loadShowcase(id: number): void {
        this.showcaseService.getShowcase(id).subscribe({
            next: (data) => {
                this.showcase = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading showcase:', err);
                this.loading = false;
            }
        });
    }

    toggleLike(): void {
        if (!this.showcase) return;
        this.showcaseService.toggleLike(this.showcase.showcaseId).subscribe({
            next: (result) => {
                if (this.showcase) {
                    this.showcase.hasLiked = result.liked;
                    this.showcase.likesCount += result.liked ? 1 : -1;
                }
            }
        });
    }
}
