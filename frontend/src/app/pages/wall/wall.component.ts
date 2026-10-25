import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { City, PurchaseType, Quote, Wall, WallArea, errorMessage } from '../../core/models';
import {
  Point,
  Rect,
  View,
  clamp,
  colorFor,
  fitView,
  formatRupees,
  hitTest,
  rectFromDrag,
  screenToWorld,
  zoomAt,
} from './wall-math';

type Mode = 'select' | 'pan';
type DragKind = 'select' | 'pan';

@Component({
  selector: 'app-wall',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Pixel wall</h1>
    <p class="muted">
      Every square on this wall is advertising space. Drag to choose an area and see its price. Click a
      coloured block to open that business.
    </p>

    <div class="wall-toolbar">
      <label class="inline"
        >City
        <select name="city" [ngModel]="cityId" (ngModelChange)="onCityChange($event)">
          @for (c of cities; track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </label>

      <div class="seg" role="group" aria-label="Tool">
        <button type="button" class="btn" [class.secondary]="mode !== 'select'" (click)="setMode('select')">Select</button>
        <button type="button" class="btn" [class.secondary]="mode !== 'pan'" (click)="setMode('pan')">Move</button>
      </div>

      <div class="seg" role="group" aria-label="Zoom">
        <button type="button" class="btn secondary" (click)="zoomBy(0.7)" aria-label="Zoom out">&minus;</button>
        <button type="button" class="btn secondary" (click)="zoomBy(1.4)" aria-label="Zoom in">+</button>
        <button type="button" class="btn secondary" (click)="resetView()">Fit</button>
      </div>
    </div>

    @if (error) {
      <p class="error">{{ error }}</p>
    }
    @if (!loading && cities.length === 0 && !error) {
      <p class="muted">No city is set up yet. The administrator needs to add one first.</p>
    }

    <div #holder class="canvas-holder">
      <canvas
        #canvas
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerCancel()"
        (wheel)="onWheel($event)"
        (contextmenu)="$event.preventDefault()"
        [class.pan]="mode === 'pan'"
      ></canvas>
    </div>

    <p class="small legend">
      <span class="swatch free"></span> Free
      <span class="swatch taken"></span> Taken
      <span class="swatch pick"></span> Your selection
      &middot; Mouse wheel zooms. Use <strong>Move</strong> (or the right mouse button) to drag the wall around.
    </p>

    <div class="wall-panels">
      <section class="panel wide">
        <h2>Your selection</h2>
        @if (sel; as s) {
          <div class="two4">
            <label>Left (x) <input type="number" name="sx" [ngModel]="s.x" (ngModelChange)="setField('x', $event)" /></label>
            <label>Top (y) <input type="number" name="sy" [ngModel]="s.y" (ngModelChange)="setField('y', $event)" /></label>
            <label>Width <input type="number" name="sw" [ngModel]="s.width" (ngModelChange)="setField('width', $event)" /></label>
            <label>Height <input type="number" name="sh" [ngModel]="s.height" (ngModelChange)="setField('height', $event)" /></label>
          </div>

          <div class="two">
            <label
              >Placement
              <select name="ptype" [ngModel]="purchaseType" (ngModelChange)="onTypeChange($event)">
                <option value="PERMANENT">Permanent</option>
                <option value="TIMED">Time-limited campaign</option>
              </select>
            </label>
            @if (purchaseType === 'TIMED') {
              <label
                >Days (1 to 365)
                <input type="number" name="days" min="1" max="365" [ngModel]="days" (ngModelChange)="onDaysChange($event)" />
              </label>
            }
          </div>

          @if (quoteLoading) {
            <p class="muted">Checking price...</p>
          } @else if (quoteError) {
            <p class="error">{{ quoteError }}</p>
          } @else {
            @if (quote; as q) {
              <p>
                <strong>{{ q.pixels }}</strong> pixels
                @if (q.totalPaise > 0) {
                  &middot; price <strong>{{ rupees(q.totalPaise) }}</strong>
                }
              </p>
              <p [class.ok]="q.available" [class.error]="!q.available">{{ q.message }}</p>
            }
          }

          <div class="row">
            <button type="button" class="btn" disabled title="Online purchase opens in Stage 4">Buy this area</button>
            <button type="button" class="btn secondary" (click)="clearSelection()">Clear</button>
          </div>
          <p class="small">
            Online purchase opens in the next stage.
            @if (!auth.isLoggedIn()) {
              You will need a business account: <a routerLink="/register">sign up</a> or
              <a routerLink="/login">log in</a>.
            }
          </p>
        } @else {
          <p class="muted">Drag on the wall to choose an area (at least {{ minSize }} x {{ minSize }} pixels).</p>
        }
      </section>

      <section class="panel wide">
        <h2>Selected block</h2>
        @if (picked; as p) {
          <h3>{{ p.businessName }}</h3>
          <p class="muted">
            {{ p.purchaseType === 'PERMANENT' ? 'Permanent placement' : 'Campaign until ' + dateLabel(p.endsAt) }}
            &middot; {{ p.width }} x {{ p.height }} pixels at ({{ p.x }}, {{ p.y }})
          </p>
          @if (p.businessId !== null) {
            <a class="btn" [routerLink]="['/business', p.businessId]">View business</a>
          }
        } @else {
          <p class="muted">Click a coloured block on the wall to see who it belongs to.</p>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .wall-toolbar { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; margin: 0.75rem 0; }
      .wall-toolbar label.inline { display: flex; gap: 0.5rem; align-items: center; margin: 0; }
      .seg { display: flex; gap: 0.35rem; }
      .canvas-holder { width: 100%; height: min(70vh, 640px); min-height: 320px; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #f4f1ea; }
      canvas { display: block; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
      canvas.pan { cursor: grab; }
      .legend { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
      .swatch { display: inline-block; width: 14px; height: 14px; border-radius: 3px; border: 1px solid #bbb; vertical-align: middle; margin-right: 0.25rem; }
      .swatch.free { background: #fff; }
      .swatch.taken { background: hsl(20, 62%, 58%); }
      .swatch.pick { background: rgba(46, 160, 67, 0.35); border-color: #2ea043; }
      .wall-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .wall-panels .panel { margin: 1rem 0; max-width: none; }
      .two4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
      .ok { color: #1a7f37; }
      @media (max-width: 760px) { .wall-panels { grid-template-columns: 1fr; } .two4 { grid-template-columns: 1fr 1fr; } }
    `,
  ],
})
export class WallComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('holder', { static: true }) private holderRef!: ElementRef<HTMLDivElement>;

  cities: City[] = [];
  cityId: number | null = null;
  wall: Wall | null = null;
  loading = true;
  error = '';

  mode: Mode = 'select';
  sel: Rect | null = null;
  picked: WallArea | null = null;
  purchaseType: PurchaseType = 'PERMANENT';
  days = 7;

  quote: Quote | null = null;
  quoteLoading = false;
  quoteError = '';

  private view: View = { scale: 1, offsetX: 0, offsetY: 0 };
  private cssWidth = 0;
  private cssHeight = 0;
  private resizeObserver?: ResizeObserver;
  private needsFit = true;

  private drag: { kind: DragKind; startX: number; startY: number; world0: Point; originX: number; originY: number; moved: boolean } | null = null;
  private readonly quoteTrigger = new Subject<void>();

  constructor() {
    this.quoteTrigger
      .pipe(
        debounceTime(200),
        switchMap(() => {
          const s = this.sel;
          if (!s || this.cityId === null) {
            return of(null);
          }
          this.quoteLoading = true;
          this.quoteError = '';
          return this.api
            .quote(this.cityId, {
              x: s.x,
              y: s.y,
              width: s.width,
              height: s.height,
              purchaseType: this.purchaseType,
              days: this.purchaseType === 'TIMED' ? this.days : undefined,
            })
            .pipe(
              catchError((e) => {
                this.quoteError = errorMessage(e, 'Could not check the price.');
                return of(null);
              }),
            );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((q) => {
        this.quote = q;
        this.quoteLoading = false;
        this.draw();
      });
  }

  // ---------- lifecycle ----------

  ngOnInit(): void {
    this.api.cities().subscribe({
      next: (list) => {
        this.cities = list;
        if (list.length > 0) {
          this.cityId = list[0].id;
          this.loadWall();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not load cities. Is the backend running?';
      },
    });
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.holderRef.nativeElement);
    this.resize();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  // ---------- data ----------

  onCityChange(id: number | null): void {
    this.cityId = id;
    this.clearSelection();
    this.picked = null;
    this.loadWall();
  }

  private loadWall(): void {
    if (this.cityId === null) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.api.wall(this.cityId).subscribe({
      next: (w) => {
        this.wall = w;
        this.loading = false;
        this.needsFit = true;
        this.fitIfReady();
        this.draw();
      },
      error: (e) => {
        this.loading = false;
        this.error = errorMessage(e, 'Could not load the wall.');
      },
    });
  }

  // ---------- selection fields ----------

  setMode(m: Mode): void {
    this.mode = m;
  }

  setField(key: 'x' | 'y' | 'width' | 'height', value: unknown): void {
    if (!this.sel || typeof value !== 'number' || !Number.isFinite(value)) {
      return;
    }
    this.sel = { ...this.sel, [key]: Math.trunc(value) };
    this.requestQuote();
    this.draw();
  }

  onTypeChange(t: PurchaseType): void {
    this.purchaseType = t;
    this.requestQuote();
  }

  onDaysChange(value: unknown): void {
    if (typeof value === 'number' && Number.isFinite(value)) {
      this.days = clamp(Math.trunc(value), 1, 365);
      this.requestQuote();
    }
  }

  clearSelection(): void {
    this.sel = null;
    this.quote = null;
    this.quoteError = '';
    this.draw();
  }

  private requestQuote(): void {
    this.quote = null;
    this.quoteError = '';
    this.quoteTrigger.next();
  }

  rupees(paise: number): string {
    return formatRupees(paise);
  }

  dateLabel(iso: string | null): string {
    return iso ? new Date(iso).toLocaleDateString('en-IN') : '';
  }

  get minSize(): number {
    return this.wall?.minSize ?? 10;
  }

  // ---------- view control ----------

  zoomBy(factor: number): void {
    this.view = zoomAt(this.view, this.cssWidth / 2, this.cssHeight / 2, factor, this.minScale(), this.maxScale());
    this.draw();
  }

  resetView(): void {
    this.needsFit = true;
    this.fitIfReady();
    this.draw();
  }

  private minScale(): number {
    const w = this.wall;
    return w ? fitView(this.cssWidth, this.cssHeight, w.gridWidth, w.gridHeight).scale * 0.8 : 0.05;
  }

  private maxScale(): number {
    return 40;
  }

  private fitIfReady(): void {
    const w = this.wall;
    if (this.needsFit && w && this.cssWidth > 0 && this.cssHeight > 0) {
      this.view = fitView(this.cssWidth, this.cssHeight, w.gridWidth, w.gridHeight);
      this.needsFit = false;
    }
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = this.holderRef.nativeElement.getBoundingClientRect();
    this.cssWidth = Math.max(1, Math.floor(rect.width));
    this.cssHeight = Math.max(1, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(this.cssWidth * dpr);
    canvas.height = Math.floor(this.cssHeight * dpr);
    this.fitIfReady();
    this.draw();
  }

  // ---------- pointer handling ----------

  private local(e: MouseEvent): Point {
    const r = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  onWheel(e: WheelEvent): void {
    e.preventDefault();
    const p = this.local(e);
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
    this.view = zoomAt(this.view, p.x, p.y, factor, this.minScale(), this.maxScale());
    this.draw();
  }

  onPointerDown(e: PointerEvent): void {
    if (!this.wall) {
      return;
    }
    const p = this.local(e);
    const kind: DragKind = this.mode === 'pan' || e.button === 1 || e.button === 2 ? 'pan' : 'select';
    this.drag = {
      kind,
      startX: p.x,
      startY: p.y,
      world0: screenToWorld(this.view, p.x, p.y),
      originX: this.view.offsetX,
      originY: this.view.offsetY,
      moved: false,
    };
    this.canvasRef.nativeElement.setPointerCapture(e.pointerId);
  }

  onPointerMove(e: PointerEvent): void {
    const d = this.drag;
    const w = this.wall;
    if (!d || !w) {
      return;
    }
    const p = this.local(e);
    const dx = p.x - d.startX;
    const dy = p.y - d.startY;
    if (!d.moved && Math.hypot(dx, dy) > 4) {
      d.moved = true;
    }
    if (!d.moved) {
      return;
    }
    if (d.kind === 'pan') {
      this.view = { ...this.view, offsetX: d.originX + dx, offsetY: d.originY + dy };
    } else {
      this.sel = rectFromDrag(d.world0, screenToWorld(this.view, p.x, p.y), w.gridWidth, w.gridHeight);
    }
    this.draw();
  }

  onPointerUp(e: PointerEvent): void {
    const d = this.drag;
    this.drag = null;
    const canvas = this.canvasRef.nativeElement;
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (!d || !this.wall) {
      return;
    }
    if (!d.moved) {
      // a click, not a drag: pick the block under the cursor
      const hit = hitTest(this.wall.areas, d.world0.x, d.world0.y);
      this.picked = hit;
      this.draw();
    } else if (d.kind === 'select') {
      this.requestQuote();
    }
  }

  onPointerCancel(): void {
    this.drag = null;
  }

  // ---------- drawing ----------

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    const w = this.wall;
    if (!canvas || !ctx) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const v = this.view;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f4f1ea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!w) {
      return;
    }

    ctx.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, dpr * v.offsetX, dpr * v.offsetY);

    // the wall itself
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w.gridWidth, w.gridHeight);

    // grid lines get finer as you zoom in
    const step = v.scale >= 12 ? 10 : v.scale >= 3 ? 50 : 100;
    ctx.lineWidth = 1 / v.scale;
    ctx.strokeStyle = '#ece8df';
    ctx.beginPath();
    for (let gx = 0; gx <= w.gridWidth; gx += step) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, w.gridHeight);
    }
    for (let gy = 0; gy <= w.gridHeight; gy += step) {
      ctx.moveTo(0, gy);
      ctx.lineTo(w.gridWidth, gy);
    }
    ctx.stroke();

    // taken blocks
    for (const a of w.areas) {
      ctx.fillStyle = colorFor(a.businessId ?? a.id);
      ctx.fillRect(a.x, a.y, a.width, a.height);
      ctx.strokeStyle = a === this.picked ? '#111' : 'rgba(255,255,255,0.9)';
      ctx.lineWidth = (a === this.picked ? 2.5 : 1) / v.scale;
      ctx.strokeRect(a.x, a.y, a.width, a.height);

      if (a.width * v.scale >= 56 && a.height * v.scale >= 20) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(a.x, a.y, a.width, a.height);
        ctx.clip();
        ctx.fillStyle = '#1b1b1b';
        ctx.font = `${12 / v.scale}px system-ui, sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(a.businessName, a.x + 3 / v.scale, a.y + 3 / v.scale);
        ctx.restore();
      }
    }

    // wall border
    ctx.strokeStyle = '#8a8478';
    ctx.lineWidth = 2 / v.scale;
    ctx.strokeRect(0, 0, w.gridWidth, w.gridHeight);

    // the visitor's selection: green = free, red = taken/invalid, orange = not checked yet
    const s = this.sel;
    if (s) {
      const q = this.quote;
      const fill = q ? (q.available ? 'rgba(46,160,67,0.35)' : 'rgba(207,34,46,0.35)') : 'rgba(219,135,0,0.35)';
      const line = q ? (q.available ? '#2ea043' : '#cf222e') : '#db8700';
      ctx.fillStyle = fill;
      ctx.fillRect(s.x, s.y, s.width, s.height);
      ctx.strokeStyle = line;
      ctx.lineWidth = 2 / v.scale;
      ctx.strokeRect(s.x, s.y, s.width, s.height);
    }
  }
}
