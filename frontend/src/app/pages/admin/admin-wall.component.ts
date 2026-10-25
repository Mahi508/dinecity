import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Business, City, PurchaseType, Wall, errorMessage } from '../../core/models';

/**
 * Admin tool: give an approved business a free placement on the wall (launch partners, testing),
 * and release placements again. Real purchases arrive in Stage 4.
 */
@Component({
  selector: 'app-admin-wall',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="panel wide">
      <h2>Wall placements</h2>
      <p class="muted">Place a business on the pixel wall without payment (useful for launch partners and testing).</p>

      <label
        >City
        <select name="wallCity" [ngModel]="cityId" (ngModelChange)="onCity($event)">
          @for (c of cities; track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </label>

      <form (ngSubmit)="grant()">
        <label
          >Business (approved, in this city)
          <select name="biz" [(ngModel)]="businessId" required>
            <option [ngValue]="null" disabled>Choose a business</option>
            @for (b of businesses; track b.id) {
              <option [ngValue]="b.id">{{ b.name }}</option>
            }
          </select>
        </label>
        <div class="two4">
          <label>Left (x) <input name="gx" type="number" [(ngModel)]="x" min="0" required /></label>
          <label>Top (y) <input name="gy" type="number" [(ngModel)]="y" min="0" required /></label>
          <label>Width <input name="gw" type="number" [(ngModel)]="width" min="1" required /></label>
          <label>Height <input name="gh" type="number" [(ngModel)]="height" min="1" required /></label>
        </div>
        <div class="two">
          <label
            >Type
            <select name="gtype" [(ngModel)]="purchaseType">
              <option value="PERMANENT">Permanent</option>
              <option value="TIMED">Time-limited</option>
            </select>
          </label>
          @if (purchaseType === 'TIMED') {
            <label>Days <input name="gdays" type="number" [(ngModel)]="days" min="1" max="365" /></label>
          }
        </div>
        <button class="btn" type="submit" [disabled]="businessId === null">Place on wall</button>
      </form>
      @if (msg) {
        <p [class.error]="isError">{{ msg }}</p>
      }

      <h3>Current placements</h3>
      @if (wall && wall.areas.length === 0) {
        <p class="muted">Nothing is placed in this city yet.</p>
      }
      @if (wall; as w) {
        @for (a of w.areas; track a.id) {
          <div class="row">
            <span>
              <strong>{{ a.businessName }}</strong>
              &middot; {{ a.width }} x {{ a.height }} at ({{ a.x }}, {{ a.y }})
              &middot; {{ a.purchaseType === 'PERMANENT' ? 'permanent' : 'until ' + dateLabel(a.endsAt) }}
            </span>
            <button type="button" class="btn secondary" (click)="release(a.id)">Release</button>
          </div>
        }
      }
    </section>
  `,
  styles: [
    `
      .two4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
      .row { padding: 0.35rem 0; border-bottom: 1px solid var(--line); }
      @media (max-width: 640px) { .two4 { grid-template-columns: 1fr 1fr; } }
    `,
  ],
})
export class AdminWallComponent implements OnInit {
  private readonly api = inject(ApiService);

  cities: City[] = [];
  cityId: number | null = null;
  approved: Business[] = [];
  wall: Wall | null = null;

  businessId: number | null = null;
  x = 0;
  y = 0;
  width = 20;
  height = 20;
  purchaseType: PurchaseType = 'PERMANENT';
  days = 30;

  msg = '';
  isError = false;

  get businesses(): Business[] {
    return this.approved.filter((b) => b.cityId === this.cityId);
  }

  ngOnInit(): void {
    this.api.cities().subscribe({
      next: (list) => {
        this.cities = list;
        if (list.length > 0) {
          this.onCity(list[0].id);
        }
      },
    });
    this.api.adminBusinesses('APPROVED').subscribe({ next: (list) => (this.approved = list) });
  }

  onCity(id: number | null): void {
    this.cityId = id;
    this.businessId = null;
    this.loadWall();
  }

  loadWall(): void {
    if (this.cityId === null) {
      return;
    }
    this.api.wall(this.cityId).subscribe({ next: (w) => (this.wall = w) });
  }

  grant(): void {
    if (this.businessId === null) {
      return;
    }
    this.api
      .grantPlacement({
        businessId: this.businessId,
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        purchaseType: this.purchaseType,
        days: this.purchaseType === 'TIMED' ? this.days : undefined,
      })
      .subscribe({
        next: (a) => {
          this.msg = `Placed ${a.businessName} on the wall.`;
          this.isError = false;
          this.loadWall();
        },
        error: (e) => {
          this.msg = errorMessage(e, 'Could not place the business.');
          this.isError = true;
        },
      });
  }

  release(areaId: number): void {
    this.api.releasePlacement(areaId).subscribe({
      next: () => {
        this.msg = 'Placement released.';
        this.isError = false;
        this.loadWall();
      },
      error: (e) => {
        this.msg = errorMessage(e, 'Could not release the placement.');
        this.isError = true;
      },
    });
  }

  dateLabel(iso: string | null): string {
    return iso ? new Date(iso).toLocaleDateString('en-IN') : '';
  }
}
