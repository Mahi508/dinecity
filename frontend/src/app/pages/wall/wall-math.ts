/** Pure helpers for the pixel wall canvas. No Angular code, so they are easy to test. */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** scale = screen pixels per wall pixel; offsetX/offsetY = where wall point (0,0) sits on the canvas. */
export interface View {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Point {
  x: number;
  y: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function screenToWorld(view: View, sx: number, sy: number): Point {
  return { x: (sx - view.offsetX) / view.scale, y: (sy - view.offsetY) / view.scale };
}

/** Scales the view by `factor` while keeping the wall point under the cursor fixed. */
export function zoomAt(view: View, sx: number, sy: number, factor: number, minScale: number, maxScale: number): View {
  const scale = clamp(view.scale * factor, minScale, maxScale);
  const real = scale / view.scale;
  return {
    scale,
    offsetX: sx - (sx - view.offsetX) * real,
    offsetY: sy - (sy - view.offsetY) * real,
  };
}

/** The view that shows the whole wall, centred, with a small margin. */
export function fitView(canvasWidth: number, canvasHeight: number, gridWidth: number, gridHeight: number): View {
  const margin = 12;
  const scale = Math.max(
    0.01,
    Math.min((canvasWidth - margin * 2) / gridWidth, (canvasHeight - margin * 2) / gridHeight),
  );
  return {
    scale,
    offsetX: (canvasWidth - gridWidth * scale) / 2,
    offsetY: (canvasHeight - gridHeight * scale) / 2,
  };
}

/**
 * Rectangle covered by dragging from one wall point to another. Both end pixels are included,
 * and the result is clamped to the wall.
 */
export function rectFromDrag(a: Point, b: Point, gridWidth: number, gridHeight: number): Rect {
  const x0 = clamp(Math.floor(Math.min(a.x, b.x)), 0, gridWidth - 1);
  const y0 = clamp(Math.floor(Math.min(a.y, b.y)), 0, gridHeight - 1);
  const x1 = clamp(Math.floor(Math.max(a.x, b.x)), 0, gridWidth - 1);
  const y1 = clamp(Math.floor(Math.max(a.y, b.y)), 0, gridHeight - 1);
  return { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/** The topmost (last drawn) item that contains the wall point, or null. */
export function hitTest<T extends Rect>(items: readonly T[], wx: number, wy: number): T | null {
  for (let i = items.length - 1; i >= 0; i--) {
    const r = items[i];
    if (wx >= r.x && wx < r.x + r.width && wy >= r.y && wy < r.y + r.height) {
      return r;
    }
  }
  return null;
}

export function formatRupees(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}

/** A stable, pleasant colour for a business (same business = same colour). */
export function colorFor(id: number): string {
  const hue = (id * 137.508) % 360;
  return `hsl(${hue.toFixed(0)}, 62%, 58%)`;
}
