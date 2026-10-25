import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Adds the login token to calls to our own API, and signs out when the server says it has expired. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const isApiCall = req.url.startsWith('/api/');
  const authed = token && isApiCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err) => {
      if (err?.status === 401 && token && !req.url.startsWith('/api/auth/login')) {
        auth.clearSession();
      }
      return throwError(() => err);
    }),
  );
};
