import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">DineCity</a>
      <nav>
        <a routerLink="/wall">Pixel wall</a>
        @if (auth.user(); as u) {
          @if (u.role === 'OWNER') {
            <a routerLink="/owner">My businesses</a>
          }
          @if (u.role === 'ADMIN') {
            <a routerLink="/admin">Admin</a>
          }
          <span class="muted">{{ u.fullName }}</span>
          <button class="link" type="button" (click)="auth.logout()">Log out</button>
        } @else {
          <a routerLink="/login">Log in</a>
          <a class="btn" routerLink="/register">Sign up</a>
        }
      </nav>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
