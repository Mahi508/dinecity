import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="panel">
      <h1>Create your account</h1>
      <form (ngSubmit)="submit()">
        <label>Full name <input name="fullName" [(ngModel)]="fullName" required maxlength="150" /></label>
        <label>Email <input name="email" type="email" [(ngModel)]="email" required autocomplete="username" /></label>
        <label
          >Password (min 8 characters)
          <input
            name="password"
            type="password"
            [(ngModel)]="password"
            required
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
        /></label>
        <label
          >I am a
          <select name="role" [(ngModel)]="role">
            <option value="CUSTOMER">Customer (I want to discover places)</option>
            <option value="OWNER">Business owner (I want to list my place)</option>
          </select>
        </label>
        @if (error) {
          <p class="error">{{ error }}</p>
        }
        <button class="btn" type="submit" [disabled]="busy">{{ busy ? 'Creating...' : 'Create account' }}</button>
      </form>
      <p class="muted">Already registered? <a routerLink="/login">Log in</a></p>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  role: 'CUSTOMER' | 'OWNER' = 'CUSTOMER';
  error = '';
  busy = false;

  submit(): void {
    if (this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.auth
      .register({ fullName: this.fullName, email: this.email, password: this.password, role: this.role })
      .subscribe({
        next: () => {
          this.busy = false;
          void this.router.navigateByUrl(this.role === 'OWNER' ? '/owner' : '/');
        },
        error: (e) => {
          this.busy = false;
          this.error = errorMessage(e, 'Could not create the account.');
        },
      });
  }
}
