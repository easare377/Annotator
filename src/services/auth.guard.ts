import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  try {
    if ((await auth.session()).user) return true;
  } catch { /* The login page supplies a retryable connection error. */ }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
