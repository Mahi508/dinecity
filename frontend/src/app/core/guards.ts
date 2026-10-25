import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

/**
 * Convenience only: it hides pages from the wrong role. The real protection is on the server,
 * which checks the token on every API call.
 */
export const roleGuard =
  (...roles: Role[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    return user !== null && roles.includes(user.role) ? true : router.createUrlTree(['/login']);
  };
