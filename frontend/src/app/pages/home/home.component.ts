import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Business, Category, City, Page } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="hero">
      <h1>Find your next favourite place</h1>
      <p>Cafes, restaurants and pubs in your city.</p>
    </section>

    <form class="filters" (ngSubmit)="search(true)">
      <input name="q" [(ngModel)]="q" placeholder="Search by name, cuisine or area" aria-label="Search" />
      <select name="cityId" [(ngModel)]="cityId" aria-label="City">
        <option [ngValue]="null">All cities</option>
        @for (c of cities; track c.id) {
          <option [ngValue]="c.id">{{ c.name }}</option>
        }
      </select>
      <select name="category" [(ngModel)]="category" aria-label="Category">
        <option value="">All types</option>
        <option value="CAFE">Cafes</option>
        <option value="RESTAURANT">Restaurants</option>
        <option value="PUB">Pubs</option>
      </select>
      <button class="btn" type="submit">Search</button>
    </form>

    @if (error) {
      <p class="error">{{ error }}</p>
    }
    @if (loading) {
      <p class="muted">Loading...</p>
    }

    @if (result; as r) {
      @if (r.content.length === 0 && !loading) {
        <p class="muted">No places found yet. Try a different search.</p>
      }
      <div class="grid">
        @for (b of r.content; track b.id) {
          <a class="card" [routerLink]="['/business', b.id]">
            <span class="badge">{{ label(b.category) }}</span>
            <h3>{{ b.name }}</h3>
            <p class="muted">{{ b.cuisine || 'Cuisine not listed' }} &middot; {{ b.cityName }}</p>
            <p class="small">{{ b.address }}</p>
          </a>
        }
      </div>

      @if (r.totalPages > 1) {
        <div class="pager">
          <button class="btn secondary" [disabled]="r.page === 0" (click)="go(r.page - 1)">Previous</button>
          <span>Page {{ r.page + 1 }} of {{ r.totalPages }}</span>
          <button class="btn secondary" [disabled]="r.page + 1 >= r.totalPages" (click)="go(r.page + 1)">Next</button>
        </div>
      }
    }
  `,
})
export class HomeComponent implements OnInit {
  private readonly api = inject(ApiService);

  cities: City[] = [];
  result: Page<Business> | null = null;
  q = '';
  cityId: number | null = null;
  category: Category | '' = '';
  page = 0;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.api.cities().subscribe({ next: (c) => (this.cities = c), error: () => (this.cities = []) });
    this.search(true);
  }

  search(resetPage: boolean): void {
    if (resetPage) {
      this.page = 0;
    }
    this.loading = true;
    this.error = '';
    this.api
      .searchBusinesses({ q: this.q.trim(), cityId: this.cityId, category: this.category, page: this.page })
      .subscribe({
        next: (r) => {
          this.result = r;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'Could not load places. Is the backend running?';
        },
      });
  }

  go(page: number): void {
    this.page = page;
    this.search(false);
  }

  label(c: Category): string {
    return c === 'CAFE' ? 'Cafe' : c === 'PUB' ? 'Pub' : 'Restaurant';
  }
}
