import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Business, errorMessage } from '../../core/models';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="muted">&larr; Back to all places</a>

    @if (error) {
      <p class="error">{{ error }}</p>
    }

    @if (b; as biz) {
      <article class="detail">
        <span class="badge">{{ biz.category }}</span>
        @if (biz.status !== 'APPROVED') {
          <span class="badge warn">{{ biz.status }} (only you can see this)</span>
        }
        <h1>{{ biz.name }}</h1>
        <p class="muted">{{ biz.cuisine || 'Cuisine not listed' }} &middot; {{ biz.cityName }}</p>

        @if (biz.description) {
          <p>{{ biz.description }}</p>
        }

        <dl>
          <dt>Address</dt>
          <dd>{{ biz.address }}</dd>

          @if (hours(biz)) {
            <dt>Opening hours</dt>
            <dd>{{ hours(biz) }}</dd>
          }
          @if (biz.phone) {
            <dt>Phone</dt>
            <dd>{{ biz.phone }}</dd>
          }
          @if (biz.websiteUrl) {
            <dt>Website</dt>
            <dd><a [href]="biz.websiteUrl" target="_blank" rel="noopener noreferrer">{{ biz.websiteUrl }}</a></dd>
          }
          @for (s of socials(biz); track s[0]) {
            <dt>{{ s[0] }}</dt>
            <dd><a [href]="s[1]" target="_blank" rel="noopener noreferrer">{{ s[1] }}</a></dd>
          }
        </dl>

        @if (biz.latitude !== null && biz.longitude !== null) {
          <a
            class="btn secondary"
            target="_blank"
            rel="noopener noreferrer"
            [href]="'https://www.google.com/maps/search/?api=1&query=' + biz.latitude + ',' + biz.longitude"
            >Open in Maps</a
          >
        }
      </article>
    }
  `,
})
export class BusinessDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  b: Business | null = null;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error = 'Place not found.';
      return;
    }
    this.api.business(id).subscribe({
      next: (b) => (this.b = b),
      error: (e) => (this.error = errorMessage(e, 'Place not found.')),
    });
  }

  hours(b: Business): string {
    return b.openingHours['text'] ?? '';
  }

  socials(b: Business): [string, string][] {
    return Object.entries(b.socialLinks);
  }
}
