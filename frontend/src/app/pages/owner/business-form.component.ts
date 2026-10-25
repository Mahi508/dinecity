import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Business, BusinessRequest, Category, City, errorMessage } from '../../core/models';

@Component({
  selector: 'app-business-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <a routerLink="/owner" class="muted">&larr; Back to my businesses</a>
    <h1>{{ editId ? 'Edit business' : 'Add a business' }}</h1>

    @if (cities.length === 0 && citiesLoaded) {
      <p class="error">No cities are available yet. Ask the administrator to add your city first.</p>
    }

    <form class="panel wide" (ngSubmit)="submit()">
      <label>Business name * <input name="name" [(ngModel)]="name" required maxlength="200" /></label>

      <div class="two">
        <label
          >Type *
          <select name="category" [(ngModel)]="category">
            <option value="CAFE">Cafe</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="PUB">Pub</option>
          </select>
        </label>
        <label
          >City *
          <select name="cityId" [(ngModel)]="cityId" required>
            <option [ngValue]="null" disabled>Choose a city</option>
            @for (c of cities; track c.id) {
              <option [ngValue]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>
      </div>

      <label>Cuisine (e.g. South Indian, Italian) <input name="cuisine" [(ngModel)]="cuisine" maxlength="100" /></label>
      <label>Address * <input name="address" [(ngModel)]="address" required maxlength="300" /></label>
      <label>Description <textarea name="description" rows="4" [(ngModel)]="description" maxlength="5000"></textarea></label>
      <label>Opening hours (free text) <input name="hours" [(ngModel)]="hours" placeholder="Mon-Sun 9am - 11pm" maxlength="300" /></label>
      <label>Phone <input name="phone" [(ngModel)]="phone" maxlength="30" /></label>
      <label>Website (https://...) <input name="website" [(ngModel)]="website" maxlength="300" /></label>
      <label>Instagram link <input name="instagram" [(ngModel)]="instagram" maxlength="300" /></label>
      <label>Logo image link (https://...) <input name="logo" [(ngModel)]="logo" maxlength="500" /></label>

      <div class="two">
        <label>Latitude (optional) <input name="lat" type="number" step="any" [(ngModel)]="latitude" /></label>
        <label>Longitude (optional) <input name="lng" type="number" step="any" [(ngModel)]="longitude" /></label>
      </div>

      @if (error) {
        <p class="error">{{ error }}</p>
      }
      <button class="btn" type="submit" [disabled]="busy">{{ busy ? 'Saving...' : 'Save business' }}</button>
    </form>
  `,
})
export class BusinessFormComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  editId: number | null = null;
  cities: City[] = [];
  citiesLoaded = false;

  name = '';
  category: Category = 'CAFE';
  cityId: number | null = null;
  cuisine = '';
  address = '';
  description = '';
  hours = '';
  phone = '';
  website = '';
  instagram = '';
  logo = '';
  latitude: number | null = null;
  longitude: number | null = null;

  error = '';
  busy = false;

  ngOnInit(): void {
    this.api.cities().subscribe({
      next: (c) => {
        this.cities = c;
        this.citiesLoaded = true;
      },
      error: () => (this.citiesLoaded = true),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      // The edit page reuses the public detail endpoint: owners can read their own business at any status.
      this.api.business(this.editId).subscribe({
        next: (b) => this.fill(b),
        error: (e) => (this.error = errorMessage(e, 'Business not found.')),
      });
    }
  }

  private fill(b: Business): void {
    this.name = b.name;
    this.category = b.category;
    this.cityId = b.cityId;
    this.cuisine = b.cuisine ?? '';
    this.address = b.address;
    this.description = b.description ?? '';
    this.hours = b.openingHours['text'] ?? '';
    this.phone = b.phone ?? '';
    this.website = b.websiteUrl ?? '';
    this.instagram = b.socialLinks['instagram'] ?? '';
    this.logo = b.logoUrl ?? '';
    this.latitude = b.latitude;
    this.longitude = b.longitude;
  }

  submit(): void {
    if (this.cityId === null) {
      this.error = 'Please choose a city.';
      return;
    }
    const req: BusinessRequest = {
      cityId: this.cityId,
      name: this.name,
      category: this.category,
      cuisine: this.cuisine || null,
      description: this.description || null,
      address: this.address,
      latitude: this.latitude,
      longitude: this.longitude,
      phone: this.phone || null,
      websiteUrl: this.website || null,
      socialLinks: this.instagram ? { instagram: this.instagram } : {},
      openingHours: this.hours ? { text: this.hours } : {},
      logoUrl: this.logo || null,
    };

    this.busy = true;
    this.error = '';
    const call = this.editId ? this.api.updateBusiness(this.editId, req) : this.api.createBusiness(req);
    call.subscribe({
      next: () => {
        this.busy = false;
        void this.router.navigateByUrl('/owner');
      },
      error: (e) => {
        this.busy = false;
        this.error = errorMessage(e, 'Could not save the business.');
      },
    });
  }
}
