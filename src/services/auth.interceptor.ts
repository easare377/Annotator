import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  // Local signed upload URLs also travel through the same-origin API proxy.
  let url = request.url.replace(/^http:\/\/(?:127\.0\.0\.1|localhost):8000(?=\/api\/)/, '');
  if (url.startsWith(window.location.origin + '/api/')) url = url.slice(window.location.origin.length);
  const isApi = url.startsWith('/api/');
  let outgoing = isApi ? request.clone({ url, withCredentials: true }) : request;
  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const token = document.cookie.split('; ').find(cookie => cookie.startsWith('csrftoken='))?.split('=').slice(1).join('=');
    if (token) outgoing = outgoing.clone({ setHeaders: { 'X-CSRFToken': decodeURIComponent(token) } });
  }
  return next(outgoing).pipe(catchError((error: HttpErrorResponse) => {
    if (isApi && error.status === 401 && !/^\/api\/(login|signup|auth)\//.test(url)
      && !/^\/(login|signup)(?:\?|$)/.test(router.url)) {
      void router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
    }
    return throwError(() => error);
  }));
};
