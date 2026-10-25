import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="shell">
      <h1>DineCity</h1>
      <p>Discover cafes, restaurants and pubs in your city.</p>
      <p class="status">Backend: <strong>{{ backendStatus() }}</strong></p>
    </main>
  `,
  styles: [`
    .shell { max-width: 720px; margin: 4rem auto; padding: 0 1rem; }
    .status { color: #555; }
  `],
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  readonly backendStatus = signal('checking...');

  constructor() {
    this.http.get<{ status: string }>('/api/health').subscribe({
      next: (res) => this.backendStatus.set(res.status),
      error: () => this.backendStatus.set('unreachable'),
    });
  }
}
