import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Business } from '../../core/models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row">
      <h1>My businesses</h1>
      <a class="btn" routerLink="/owner/business/new">Add a business</a>
    </div>

    @if (error) {
      <p class="error">{{ error }}</p>
    }
    @if (loaded && items.length === 0) {
      <p class="muted">You have not listed a business yet. Click "Add a business" to start.</p>
    }

    <div class="grid">
      @for (b of items; track b.id) {
        <div class="card">
          <span class="badge" [class.warn]="b.status !== 'APPROVED'">{{ b.status }}</span>
          <h3>{{ b.name }}</h3>
          <p class="muted">{{ b.category }} &middot; {{ b.cityName }}</p>
          <p class="small">{{ b.address }}</p>
          <div class="row">
            <a [routerLink]="['/business', b.id]">View</a>
            <a [routerLink]="['/owner/business', b.id, 'edit']">Edit</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class OwnerDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  items: Business[] = [];
  loaded = false;
  error = '';

  ngOnInit(): void {
    this.api.myBusinesses().subscribe({
      next: (list) => {
        this.items = list;
        this.loaded = true;
      },
      error: () => (this.error = 'Could not load your businesses.'),
    });
  }
}
