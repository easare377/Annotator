import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Authentication route guard', () => {
  let auth: jasmine.SpyObj<AuthService>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['session']);
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }] });
  });
  const check = () => TestBed.runInInjectionContext(() => authGuard({} as ActivatedRouteSnapshot, { url: '/projects/data?pid=123' } as RouterStateSnapshot));
  it('allows a server-verified session after refresh', async () => {
    auth.session.and.resolveTo({
      user: {pk: 1, email: 'person@example.com', firstName: 'Person', surname: 'Example'},
      googleClientId: ''
    });
    expect(await check()).toBeTrue();
  });
  it('preserves the intended destination for anonymous users', async () => {
    auth.session.and.resolveTo({ user: null, googleClientId: '' });
    const result = await check() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fprojects%2Fdata%3Fpid%3D123');
  });
  it('does not grant access when the session check fails', async () => {
    auth.session.and.rejectWith(new Error('Network failure'));
    expect(await check()).toBeInstanceOf(UrlTree);
  });
});
