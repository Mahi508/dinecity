import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Business, BusinessStatus, City, errorMessage } from '../../core/models';
import { AdminWallComponent } from './admin-wall.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, RouterLink, AdminWallComponent],
  template: `
    <h1>Administration</h1>

    <section class="panel wide">
      <h2>Cities</h2>
      <p class="muted">
        Existing:
        @for (c of cities; track c.id; let last = $last) {
          {{ c.name }}{{ last ? '' : ', ' }}
        } @empty {
          none yet
        }
      </p>
      <form (ngSubmit)="addCity()" class="two">
        <label>City name <input name="cityName" [(ngModel)]="cityName" required maxlength="100" /></label>
        <label>State <input name="cityState" [(ngModel)]="cityState" maxlength="100" /></label>
        <button class="btn" type="submit" [disabled]="!cityName.trim()">Add city</button>
      </form>
      @if (cityMsg) {
        <p [class.error]="cityIsError">{{ cityMsg }}</p>
      }
    </section>

    <app-admin-wall />

    <section class="panel wide">
      <h2>Review businesses</h2>
      <label
        >Show
        <select name="status" [(ngModel)]="status" (ngModelChange)="load()">
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </label>
      @if (error) {
        <p class="error">{{ error }}</p>
      }
      @if (items.length === 0) {
        <p class="muted">Nothing here.</p>
      }
      @for (b of items; track b.id) {
        <div class="card">
          <h3>{{ b.name }} <span class="badge">{{ b.category }}</span></h3>
          <p class="muted">{{ b.address }}, {{ b.cityName }}</p>
          <div class="row">
            <a [routerLink]="['/business', b.id]">View</a>
            @if (b.status !== 'APPROVED') {
              <button class="btn" (click)="setStatus(b, 'APPROVED')">Approve</button>
            }
            @if (b.status !== 'REJECTED') {
              <button class="btn secondary" (click)="setStatus(b, 'REJECTED')">Reject</button>
            }
            @if (b.status === 'APPROVED') {
              <button class="btn secondary" (click)="setStatus(b, 'SUSPENDED')">Suspend</button>
            }
          </div>
        </div>
      }
    </section>
  `,
})
export class AdminComponent implements OnInit {
  private readonly api = inject(ApiService);

  cities: City[] = [];
  cityName = '';
  cityState = '';
  cityMsg = '';
  cityIsError = false;

  status: BusinessStatus = 'PENDING';
  items: Business[] = [];
  error = '';

  ngOnInit(): void {
    this.loadCities();
    this.load();
  }

  loadCities(): void {
    this.api.cities().subscribe({ next: (c) => (this.cities = c) });
  }

  addCity(): void {
    this.api.createCity({ name: this.cityName.trim(), state: this.cityState.trim(), country: 'India' }).subscribe({
      next: (c) => {
        this.cityMsg = `Added ${c.name}.`;
        this.cityIsError = false;
        this.cityName = '';
        this.cityState = '';
        this.loadCities();
      },
      error: (e) => {
        this.cityMsg = errorMessage(e, 'Could not add the city.');
        this.cityIsError = true;
      },
    });
  }

  load(): void {
    this.error = '';
    this.api.adminBusinesses(this.status).subscribe({
      next: (list) => (this.items = list),
      error: (e) => (this.error = errorMessage(e, 'Could not load businesses.')),
    });
  }

  setStatus(b: Business, status: BusinessStatus): void {
    this.api.setBusinessStatus(b.id, status).subscribe({
      next: () => this.load(),
      error: (e) => (this.error = errorMessage(e, 'Could not update the business.')),
    });
  }
}
