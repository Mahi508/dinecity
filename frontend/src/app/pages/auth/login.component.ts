import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="panel">
      <h1>Log in</h1>
      <form (ngSubmit)="submit()">
        <label>Email <input name="email" type="email" [(ngModel)]="email" required autocomplete="username" /></label>
        <label
          >Password
          <input name="password" type="password" [(ngModel)]="password" required autocomplete="current-password"
        /></label>
        @if (error) {
          <p class="error">{{ error }}</p>
        }
        <button class="btn" type="submit" [disabled]="busy">{{ busy ? 'Logging in...' : 'Log in' }}</button>
      </form>
      <p class="muted">New here? <a routerLink="/register">Create an account</a></p>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  busy = false;

  submit(): void {
    this.busy = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: (r) => {
        this.busy = false;
        const target = r.user.role === 'OWNER' ? '/owner' : r.user.role === 'ADMIN' ? '/admin' : '/';
        void this.router.navigateByUrl(target);
      },
      error: (e) => {
        this.busy = false;
        this.error = errorMessage(e, 'Could not log in.');
      },
    });
  }
}
