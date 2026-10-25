import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Role, User } from './models';

const TOKEN_KEY = 'dc_token';
const USER_KEY = 'dc_user';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

/**
 * Keeps the login state. The token lives in localStorage so a refresh keeps you signed in.
 * (Trade-off: any script on the page can read it, so never render untrusted HTML. A later
 * stage can move to HttpOnly cookies.)
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(this.read(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => this.token() !== null && this.user() !== null);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(tap((r) => this.store(r)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(tap((r) => this.store(r)));
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/']);
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    this.write(TOKEN_KEY, null);
    this.write(USER_KEY, null);
  }

  private store(r: AuthResponse): void {
    this.token.set(r.token);
    this.user.set(r.user);
    this.write(TOKEN_KEY, r.token);
    this.write(USER_KEY, JSON.stringify(r.user));
  }

  private readUser(): User | null {
    const raw = this.read(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string | null): void {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch {
      // storage unavailable (private mode etc.): the session just won't survive a refresh
    }
  }
}
